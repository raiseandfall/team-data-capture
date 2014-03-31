'use strict';

var Spaceship = function(id, ws, two) {

    var aTrail = [];
    var aLaser = [];
    var missiles = [];
    var delta = new Two.Vector();
    var mouse = new Two.Vector();
    var rotation = new Two.Vector();
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
    var i = 0;
    var speedLaser = 10;
    var ufo = new Ship(two);
    var ball = two.makeGroup();
    ball.add(ufo.getShip());

    //move the the rubberball with the mouse position
    ws.events.addEventListener(ws.EVENT.MOUSE_MOVE+'_'+id, function(e) {
      var datajson =  JSON.parse(e.detail);
      mouse.x = Math.round(datajson.data.pos.x)*two.width / datajson.data.screen.width;
      mouse.y = two.height - Math.round(datajson.data.pos.y)*two.height / datajson.data.screen.height;
      rotation.x = datajson.data.delta.x;
      rotation.y = datajson.data.delta.y;
    });

    ws.events.addEventListener(ws.EVENT.CLOSE_USER+'_'+id, function(e) {
      clearInterval(nIntervId);
      for(i = 0; i<aTrail.length; i++){
        aTrail[i].elt.remove();
      }
      aTrail = [];
      ball.remove();
    });

    ws.events.addEventListener(ws.EVENT.CLICK+'_'+id, function(e) {
      var laser = {};
      laser.elt = ufo.getLaser(mouse.x, mouse.y);
      laser.xInit = mouse.x;
      laser.x = mouse.x+200;
      laser.y = mouse.y;
      aLaser.push(laser);
    });

    ws.events.addEventListener(ws.EVENT.MOUSE_WHEEL+'_'+id, function(e) {
      ufo.startWheeling();
    });


    /**
    *
    */

    function addTrailItem(){
      var itemTrailCos = {};
      itemTrailCos.elt = two.makeCircle(mouse.x, mouse.y, radiusTrail);
      itemTrailCos.elt.noStroke().fill = 'rgba('+colorSin+', 1)';
      itemTrailCos.index = 0;
      itemTrailCos.type = 'cos';
      itemTrailCos.xInit = mouse.x;
      itemTrailCos.x = mouse.x;
      itemTrailCos.y = mouse.y;
      itemTrailCos.z = 1;

      var itemTrailSin = {};
      itemTrailSin.elt = two.makeCircle(mouse.x, mouse.y, radiusTrail);
      itemTrailSin.elt.noStroke().fill = 'rgba('+colorSin+', 1)';
      itemTrailSin.index = 0;
      itemTrailSin.type = 'sin';
      itemTrailSin.xInit = mouse.x;
      itemTrailSin.x = mouse.x;
      itemTrailSin.y = mouse.y;
      itemTrailSin.z = 1;

      aTrail.push(itemTrailCos);
      aTrail.push(itemTrailSin);
    }

    /**
    *
    */

    function checkCollision(){

    }

    nIntervId = setInterval(addTrailItem, frequence);

    two.bind('update', function() {

      delta.copy(mouse).subSelf(ball.translation);

      ball.translation.addSelf(delta);

      ball.rotation = Math.PI/2*(rotation.y/100);
      for(i = 0; i<aLaser.length; i++){
        var laser = aLaser[i];
        laser.x += speedLaser;
        laser.elt.translation.set(laser.x, laser.y);

        if(laser.x > two.width){
          laser.elt.remove();
          aLaser.splice(i,1);
        }
      }

      for(i = 0; i<aTrail.length; i++){
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

        var percent = 1-(itemTrail.xInit-itemTrail.x)/sizeTrail;
        itemTrail.elt.scale = percent*itemTrail.z/2;
        itemTrail.elt.noStroke().fill = 'rgba('+color+', '+percent*(itemTrail.z)+')';

        itemTrail.elt.translation.set(itemTrail.x, itemTrail.y);
        itemTrail.index++;

        if(itemTrail.x <= itemTrail.xInit - sizeTrail){
          itemTrail.xInit = mouse.x;
          itemTrail.x = mouse.x;
          itemTrail.y = mouse.y;
          itemTrail.index = 0;
          clearInterval(nIntervId);
        }else{
          percent = 1-(itemTrail.xInit-itemTrail.x)/sizeTrail;
          itemTrail.elt.scale = percent*itemTrail.z/2;
          itemTrail.elt.opacity = percent*(itemTrail.z);
          itemTrail.elt.translation.set(itemTrail.x, itemTrail.y);

          itemTrail.index++;
        }
      }

      for (i = 0; i < missiles.length; ++i){

        //console.log('--->',Math.abs(mouse.x - missiles[i].x));
        if(Math.abs(mouse.x - missiles[i].x) < 100&&Math.abs(mouse.y - missiles[i].y) < 100){
          console.log('COLLISION');
          ufo.protectWall();
        }
        if(missiles[i].x > two.width){
          missiles.splice(i,1);
        }
      }

    });

    this.updateMissilesPos = function(missilestotal){
      missiles = missilestotal;
    };

    this.getLaser = function(){
      return aLaser;
    };

};
