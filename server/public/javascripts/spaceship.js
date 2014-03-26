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
    var nIntervId;
    var trace = true;
    var index = 0;

    var colorCos = '255, 255, 255';
    var colorSin = '255, 255, 255';
    var radiusTrail = 20;
    var depth = 0.5;
    var frequence = 200; 
    var twist = 5; 
    var distance = 0.5; 
    var sizeTrail = 480; 
    var speedTrail = 5;


    /*var shadow = two.makeCircle(two.width / 2, two.height / 2, radius);
    shadow.noStroke().fill = 'rgba(0, 0, 0, 0.2)';
    shadow.offset = new Two.Vector(- radius / 2, radius * 2);
    shadow.scale = 0.85;*/

    var ball = two.makeCircle(two.width / 2, two.height / 2, radius);
    ball.noStroke().fill = 'white';

    /*for(var i = 0; i<ball.vertices.length; i++){
      var v = ball.vertices[i];
      v.origin = new Two.Vector().copy(v);
    }*/

    //move the the rubberball with the mouse position
    ws.events.addEventListener(ws.EVENT.MOUSE_MOVE+'_'+id, function(e) {  
      var datajson =  JSON.parse(e.detail);

      mouse.x = Math.round(datajson.data.pos.x)*two.width / datajson.data.screen.width;
      mouse.y = two.height - Math.round(datajson.data.pos.y)*two.height / datajson.data.screen.height;

      //shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
      //shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;

    });

    ws.events.addEventListener(ws.EVENT.CLOSE_USER+'_'+id, function(e) {  
      clearInterval(nIntervId);
      two.clear();
    });

    ws.events.addEventListener(ws.EVENT.CLICK+'_'+id, function(e) { 
    });

    /**
    *
    */

    function addTrailItem(){
      var itemTrailCos = {};
      itemTrailCos.v = new Two.Vector();  
      itemTrailCos.elt = two.makeCircle(mouse.x, mouse.y, radiusTrail);
      itemTrailCos.elt.noStroke().fill = 'rgba('+colorSin+', 0)';
      itemTrailCos.index = 0;
      itemTrailCos.type = 'cos';
      itemTrailCos.xInit = mouse.x;
      itemTrailCos.x = mouse.x;
      itemTrailCos.y = mouse.y;
      itemTrailCos.z = 1;

      var itemTrailSin = {};
      itemTrailSin.v = new Two.Vector();  
      itemTrailSin.elt = two.makeCircle(mouse.x, mouse.y, radiusTrail);
      itemTrailSin.elt.noStroke().fill = 'rgba('+colorSin+', 0)';
      itemTrailSin.index = 0;
      itemTrailSin.type = 'sin';
      itemTrailSin.xInit = mouse.x;
      itemTrailSin.x = mouse.x;
      itemTrailSin.y = mouse.y;
      itemTrailSin.z = 1;

      aTrail.push(itemTrailCos);
      aTrail.push(itemTrailSin);
    }

    nIntervId = setInterval(addTrailItem, frequence);

    two.bind('update', function() {

      delta.copy(mouse).subSelf(ball.translation);

      /*for(var i = 0; i<ball.vertices.length; i++){
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

      }*/

      ball.translation.addSelf(delta);

      //shadow.translation.copy(ball.translation);
      //shadow.translation.addSelf(shadow.offset);


      for(var i = 0; i<aTrail.length; i++){
        var itemTrail = aTrail[i];
        itemTrail.x -= speedTrail;

        var degrees = (itemTrail.index*twist)%360;
        var radians = degrees * (Math.PI/180);
        var color = '';

        if(itemTrail.type === 'cos'){
          itemTrail.y += Math.cos(radians)*twist*distance;
          if(degrees>0&&degrees<=180){
            itemTrail.z = degrees/180 + depth;
          }
          if(degrees>180&&degrees<=360){

            itemTrail.z = 1 - (degrees-180)/180 + depth;
          }
          color = colorCos;
        }
        if(itemTrail.type === 'sin'){
          itemTrail.y += -Math.cos(radians)*twist*distance;
          if(degrees>0&&degrees<=180){
            itemTrail.z = 1 - degrees/180 + depth;
          }
          if(degrees>180&&degrees<=360){
            itemTrail.z = (degrees-180)/180 + depth;
          }
          color = colorSin;
        }

        if(itemTrail.x <= itemTrail.xInit - sizeTrail){
          itemTrail.xInit = mouse.x;
          itemTrail.x = mouse.x;
          itemTrail.y = mouse.y;
          itemTrail.index = 0;
          clearInterval(nIntervId);
        }else{
          var percent = 1-(itemTrail.xInit-itemTrail.x)/sizeTrail;
          itemTrail.elt.scale = percent*itemTrail.z/2;
          itemTrail.elt.noStroke().fill = 'rgba('+color+', '+percent*(itemTrail.z)+')';
          itemTrail.elt.translation.set(itemTrail.x, itemTrail.y);
          
          itemTrail.index++;
        }
      }
    });
};