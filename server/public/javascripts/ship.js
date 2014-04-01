'use strict';
var Ship = function(two){
  var i,
      v,
      ufo1 = {'src':'/img/ship1.png',
              'x':10,
              'y':-52,
              'smokecolor':'#ffcf0f',
              'smokecolor2':'#FF5A00'
             },
      ufo2 = {'src':'/img/ship2.png',
              'x':20,
              'y':-80,
              'smokecolor':'#FFFFFF',
              'smokecolor2':'#FFFFFF'
            },
      ufo3 = {'src':'/img/ship3.png',
             'x':20,
             'y':-60,
             'smokecolor':'#00F0FF',
             'smokecolor2':'#FFFFFF'
           },
      ufos = [ufo1, ufo2, ufo3];

  var ufo_canvas = document.createElement('canvas');
    ufo_canvas.id = 'ufo_canvas';
    ufo_canvas.width = two.width;
    ufo_canvas.height = two.height;
    ufo_canvas.style.position = 'fixed';
    ufo_canvas.style.top = '0px';
    document.body.appendChild(ufo_canvas);
  var ufo = document.getElementById('ufo_canvas').getContext('2d');

  var type_ufo = Math.floor((Math.random()*ufos.length));
  var new_ufo = ufos[type_ufo];
  var imageUfo = new Image();
  imageUfo.src = new_ufo.src;
  ufo.drawImage(imageUfo, new_ufo.x, new_ufo.y);

  var fire = two.makeCircle(0, 0 , 50);
  fire.fill = fire.stroke = new_ufo.smokecolor;
  fire.opacity = 0.5;
  fire.scale = 0;
  for (i = 0; i < fire.vertices.length; i++) {
    v = fire.vertices[i];
    v.originalX = v.x;
  }
  var fire2 = two.makeCircle(0, 0 , 10);
  fire2.fill = fire2.stroke = new_ufo.smokecolor2;
  fire2.opacity = 0.5;
  fire2.scale = 0;
  for (i = 0; i < fire2.vertices.length; i++) {
    v = fire2.vertices[i];
    v.originalX = v.x;
  }
  var reactor = two.makeGroup(fire,fire2);

  two.bind('update', function() {
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

  this.getShip = function(){
    return reactor;
  };

  this.setPosition = function(mouse, rotation){
    ufo.clearRect(0,0,two.width,two.height);
    ufo.save();
    ufo.translate(mouse.x,mouse.y);
    ufo.rotate(rotation);
    ufo.drawImage(imageUfo, new_ufo.x, new_ufo.y);
    ufo.restore();
  };

  this.startWheeling = function(){
    if(fire.scale<1){
      fire.scale += 0.04;
      fire2.scale += 0.04;
    }
  };

  this.getLaser = function(x,y){
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
