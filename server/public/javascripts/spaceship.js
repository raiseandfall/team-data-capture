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
};