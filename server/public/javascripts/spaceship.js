'use strict';
var Spaceship = function(id, ws) {
    var type = 'svg';
    var two = new Two({
      type: Two.Types[type],
      fullscreen: true,
      autostart: true
    }).appendTo(document.body);


    Two.Resoultion = 32;

    var aTrail = [];

    var delta = new Two.Vector();
    var mouse = new Two.Vector();
    var drag = 0.33;
    var radius = 50;
    var radiusTrail = 20;
    var speedTrail = 10;
    var nIntervId;
    var trace = true;
    var index = 0;

    /*for(var j = 0; j<18; j++){
      var degrees = j*10;
      console.log(j+'0:'+Math.cos(radians));
    }*/

    var shadow = two.makeCircle(two.width / 2, two.height / 2, radius);
    shadow.noStroke().fill = 'rgba(0, 0, 0, 0.2)';
    shadow.offset = new Two.Vector(- radius / 2, radius * 2);
    shadow.scale = 0.85;

    var ball = two.makeCircle(two.width / 2, two.height / 2, radius);
    ball.noStroke().fill = 'white';

    for(var i = 0; i<ball.vertices.length; i++){
      var v = ball.vertices[i];
      v.origin = new Two.Vector().copy(v);
    }

    //move the the rubberball with the mouse position
    ws.events.addEventListener(ws.EVENT.MOUSE_MOVE+'_'+id, function(e) {  
      var datajson =  JSON.parse(e.detail);
      mouse.x = Math.round(datajson.data.pos.x);
      mouse.y = Math.round(datajson.data.pos.y);
      shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
      shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
    });

    ws.events.addEventListener(ws.EVENT.CLOSE_USER+'_'+id, function(e) {  
      two.clear();
    });

    ws.events.addEventListener(ws.EVENT.CLICK+'_'+id, function(e) { 
    });
    
    function addTrailItem(index){
      var itemTrail = {};
      itemTrail.v = new Two.Vector();  
      itemTrail.elt = two.makeCircle(mouse.x, mouse.y, radiusTrail);
      itemTrail.elt.noStroke().fill = 'rgba(233, 10, 10, 1)';
      itemTrail.index = 6;
      itemTrail.type = (index++)%2;
      itemTrail.x = mouse.x;
      itemTrail.y = mouse.y;
      itemTrail.z = 1;
      aTrail.push(itemTrail);
    }

    nIntervId = setInterval(addTrailItem, 200);

    two.bind('update', function() {

      delta.copy(mouse).subSelf(ball.translation);

      for(var i = 0; i<ball.vertices.length; i++){
        var v = ball.vertices[i];

        var dist = v.origin.distanceTo(delta);
        var pct = dist / radius;

        var x = delta.x * pct;
        var y = delta.y * pct;

        var destx = v.origin.x - x;
        var desty = v.origin.y - y;

        v.x += (destx - v.x) * drag;
        v.y += (desty - v.y) * drag;

        shadow.vertices[i].copy(v);

      }

      ball.translation.addSelf(delta);

      shadow.translation.copy(ball.translation);
      shadow.translation.addSelf(shadow.offset);

      /*if(aTrail.length && trace){
        var temp = aTrail[0];
        var degrees = (temp.index*15)%360;
        var radians = degrees * (Math.PI/180);
        var cos = Math.cos(radians);
        console.log(degrees+':'+cos);
      }*/

      for(i = 0; i<aTrail.length; i++){
        var itemTrail = aTrail[i];
        itemTrail.x -= speedTrail;

        var degrees = (itemTrail.index*15)%360;
        var radians = degrees * (Math.PI/180);

        //if(itemTrail.type){
          itemTrail.y += Math.cos(radians)*10;
          if(degrees>0&&degrees<=180){
            itemTrail.z+=0.1;
          }
          if(degrees>180&&degrees<=360){
            itemTrail.z-=0.1;
          }
        /*}else{
          itemTrail.y += Math.sin(radians)*10;
          if(degrees<90&&degrees>=270){
            itemTrail.z+=0.1;
          }
          if(degrees>=90&&degrees<270){
            itemTrail.z-=0.1;
          }
        }*/

        itemTrail.elt.scale = itemTrail.z/2;
        itemTrail.elt.noStroke().fill = 'rgba(233, 10, 10, '+itemTrail.z+')';

        //itemTrail.elt.translation.addSelf(itemTrail.v);
        itemTrail.elt.translation.set(itemTrail.x, itemTrail.y);
        itemTrail.index++;
        if(itemTrail.x <= -two.width){
          aTrail.splice(i, 1);
          itemTrail.elt.remove();
          trace = false;
        }
      }
    });
};