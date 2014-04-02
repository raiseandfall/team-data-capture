'use strict';

var Spaceship = function(id, ws, two) {

    var aTrail = [];
    var aLaser = [];
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

    var bubbleText;
    var message = '';
    var textTimer;
    var textScale = 1;
    var textTranslate = 0;
    var contentBubble;
    var audio = document.getElementById('laser');
    var reactor_audio = document.getElementById('reactor_audio');

    var v;
    var ufo_canvas;
    var ufo1 = {'src':'/images/ship1.png',
                'x':10,
                'y':-52,
                'smokecolor':'#ffcf0f',
                'smokecolor2':'#FF5A00'
               },
        ufo2 = {'src':'/images/ship2.png',
                'x':20,
                'y':-80,
                'smokecolor':'#FFFFFF',
                'smokecolor2':'#FFFFFF'
              },
        ufo3 = {'src':'/images/ship3.png',
               'x':20,
               'y':-60,
               'smokecolor':'#00F0FF',
               'smokecolor2':'#FFFFFF'
             };
    var ufos = [ufo1, ufo2, ufo3];
    var ufo;
    var type_ufo;
    var new_ufo;
    var imageUfo;
    var fire, fire2, reactor;

    addShip();
    addReactor();

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
      reactor.remove();

      ufo_canvas.remove();
    });

    ws.events.addEventListener(ws.EVENT.CLICK+'_'+id, function(e) {
      var laser = {};
      laser.elt = getLaser(mouse.x, mouse.y);
      laser.xInit = mouse.x;
      laser.x = mouse.x+200;
      laser.y = mouse.y;
      aLaser.push(laser);
      if(audio){
        audio.currentTime=0;
        audio.play();
      }
    });

    ws.events.addEventListener(ws.EVENT.MOUSE_WHEEL+'_'+id, function(e) {
      if(fire.scale<1){
        fire.scale += 0.04;
        fire2.scale += 0.04;
      }
      if(reactor_audio){
        reactor_audio.currentTime=0;
        reactor_audio.play();
      }
    });

    ws.events.addEventListener(ws.EVENT.MESSENGER+'_'+id, function(e) {
      var detail = JSON.parse(e.detail);
      createText(detail.data.msg);
    });

    /**
    *
    */

    function addShip(){
      ufo_canvas = document.createElement('canvas');
      ufo_canvas.id = 'ufo_canvas'+id;
      ufo_canvas.width = two.width;
      ufo_canvas.height = two.height;
      ufo_canvas.style.position = 'fixed';
      ufo_canvas.style.top = '0px';
      document.body.appendChild(ufo_canvas);
      ufo = document.getElementById('ufo_canvas'+id).getContext('2d');

      type_ufo = Math.floor((Math.random()*ufos.length));
      new_ufo = ufos[type_ufo];
      imageUfo = new Image();
      imageUfo.src = new_ufo.src;
      ufo.drawImage(imageUfo, new_ufo.x, new_ufo.y);

    }

    /**
    *
    */

    function addReactor(){
      fire = two.makeCircle(0, 0 , 50);
      fire.fill = fire.stroke = new_ufo.smokecolor;
      fire.opacity = 0.5;
      fire.scale = 0;
      for (i = 0; i < fire.vertices.length; i++) {
        v = fire.vertices[i];
        v.originalX = v.x;
      }
      fire2 = two.makeCircle(0, 0 , 10);
      fire2.fill = fire2.stroke = new_ufo.smokecolor2;
      fire2.opacity = 0.5;
      fire2.scale = 0;
      for (i = 0; i < fire2.vertices.length; i++) {
        v = fire2.vertices[i];
        v.originalX = v.x;
      }
      reactor = two.makeGroup(fire,fire2);
    }
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

    function createText(msg){
      message = msg;
      if(textTimer){
        clearInterval(textTimer);
      }

      textScale = 1;
      textTranslate = 0;

      if(!bubbleText){
        bubbleText = document.createElement('canvas');
        bubbleText.id = 'canvas_text'+id;
        bubbleText.width = two.width;
        bubbleText.height = two.height;
        bubbleText.style.position = 'fixed';
        bubbleText.style.top = '0px';
        document.body.appendChild(bubbleText);
        contentBubble = document.getElementById('canvas_text'+id).getContext('2d');
      }
      textTimer = setInterval(drawText,60);
    }

    function drawText(){
      contentBubble.clearRect(0,0,two.width,two.height);
      contentBubble.save();
      contentBubble.translate(mouse.x + textTranslate - 50,mouse.y + textTranslate - 50);
      contentBubble.font = '20px pwperspectivemedium';
      contentBubble.fillStyle = 'rgba(255,255,255,'+textScale+')';
      contentBubble.fillText(message,0,0);
      contentBubble.restore();

      textTranslate -= 10;
      if(textTranslate<-100){
        textScale -= 0.2;
      }

      if(textScale<=0){
        clearInterval(textTimer);
        contentBubble.clearRect(0,0,two.width,two.height);
      }
    }

    nIntervId = setInterval(addTrailItem, frequence);

    two.bind('update', function() {

      delta.copy(mouse).subSelf(reactor.translation);
      reactor.translation.addSelf(delta);
      reactor.rotation = Math.PI/2*(rotation.y/100);
      ufo.clearRect(0,0,two.width,two.height);
      ufo.save();
      ufo.translate(mouse.x,mouse.y);
      ufo.rotate(Math.PI/2*(rotation.y/100));
      ufo.drawImage(imageUfo, new_ufo.x, new_ufo.y);
      ufo.restore();

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

      // smoke reactor
      if(fire.scale>0){
        fire.scale -= 0.01;
        fire2.scale -= 0.01;

        for (i = 0; i < fire.vertices.length; i++) {
          v = fire.vertices[i];
          if(v.x < 0){
            var rand = Math.floor((Math.random()*50)+1);
            v.x = v.originalX - rand;

            var v2 = fire2.vertices[i];
            v2.x = v2.originalX - rand;
          }
        }
      }

    });
    function getLaser(x,y){
      console.log('getlaser');
      var laser;
      switch(type_ufo){
      case 0: laser = two.makeRectangle(0, 0, 20, 2);
              laser.noStroke().fill = '#FFDC99';
              break;
      case 1: laser = two.makeRectangle(0, 0, 20, 2);
              laser.noStroke().fill = '#FFDC99';
              break;
      default:laser = two.makeGroup();
              var rect = two.makeRectangle(50, 0, 20, 20);
              rect.rotation = Math.PI/4;
              var rect2 = rect.clone();
              rect2.translation.x = 60;
              laser.add(rect,rect2);
              laser.noFill().stroke = '#00F0FF';
              break;
      }

      laser.translation.x = x;
      laser.translation.y = y;
      return laser;
    };
};
