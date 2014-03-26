'use strict';
var Spaceship = function(id, ws) {
    var type = 'svg';
    var two = new Two({
      type: Two.Types[type],
      fullscreen: true,
      autostart: true
    }).appendTo(document.body);


    Two.Resoultion = 32;

    var delta = new Two.Vector();
    var mouse = new Two.Vector();
    var drag = 0.33;
    var radius = 50;

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


    ws.events.addEventListener(ws.EVENT.MOUSE_MOVE+'_'+id, function(e) {  
      var datajson =  JSON.parse(e.detail);
      //console.log('Spaceship: ', 'mousemove_'+id, datajson.data.pos.x, datajson.data.pos.y);
      mouse.x = Math.round(datajson.data.pos.x);
      mouse.y = Math.round(datajson.data.pos.y);
      shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
      shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
    });

    /*var $window = $(window)
      .bind('mousemove', function(e) {
      })
      .bind('touchstart', function() {
        e.preventDefault();
        return false;
      })
      .bind('touchmove', function(e) {
        e.preventDefault();
        var touch = e.originalEvent.changedTouches[0]
        mouse.x = touch.pageX;
        mouse.y = touch.pageY;
        shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
        shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
        return false;
      });*/

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
    });

    /*Two.Resoultion = 32;

    var delta = new Two.Vector();
    var mouse = new Two.Vector();
    var drag = 0.33;
    var radius = 50;

    var shadow = two.makeCircle(two.width / 2, two.height / 2, radius);
    shadow.noStroke().fill = 'rgba(0, 0, 0, 0.2)';
    shadow.offset = new Two.Vector(- radius / 2, radius * 2);
    shadow.scale = 0.85;

    var ball = two.makeCircle(two.width / 2, two.height / 2, radius);
    ball.noStroke().fill = 'white';

    _.each(ball.vertices, function(v) {
      v.origin = new Two.Vector().copy(v);
    });

    var $window = $(window)
      .bind('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
        shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
      })
      .bind('touchstart', function() {
        e.preventDefault();
        return false;
      })
      .bind('touchmove', function(e) {
        e.preventDefault();
        var touch = e.originalEvent.changedTouches[0]
        mouse.x = touch.pageX;
        mouse.y = touch.pageY;
        shadow.offset.x = 5 * radius * (mouse.x - two.width / 2) / two.width;
        shadow.offset.y = 5 * radius * (mouse.y - two.height / 2) / two.height;
        return false;
      });

    two.bind('update', function() {

      delta.copy(mouse).subSelf(ball.translation);

      _.each(ball.vertices, function(v, i) {

        var dist = v.origin.distanceTo(delta);
        var pct = dist / radius;

        var x = delta.x * pct;
        var y = delta.y * pct;

        var destx = v.origin.x - x;
        var desty = v.origin.y - y;

        v.x += (destx - v.x) * drag;
        v.y += (desty - v.y) * drag;

        shadow.vertices[i].copy(v);

      });

      ball.translation.addSelf(delta);

      shadow.translation.copy(ball.translation);
      shadow.translation.addSelf(shadow.offset);
    });
*/

};