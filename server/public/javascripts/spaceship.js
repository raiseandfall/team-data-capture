'use strict';

var Spaceship = function(id, ws, two) {

    var aTrail = [];

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
    var frequence = 240;
    var twist = 5;
    var distance = 0.5;
    var sizeTrail = 480;
    var speedTrail = 5;
    var i = 0;

    var xmlns = 'http://www.w3.org/2000/svg';
    var svgUfo = document.createElementNS(xmlns, 'svg');
    svgUfo.innerHTML = '<path fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" d="M248.523,130c0,0-16.417,22.479-27.523,49.5c-12.93,31.459-20.608,68.755-16.973,78.933c6.757,18.919,92.406,10.433,89.189,0c1.064-2.704,0.899-9.63-0.38-18.933c-2.193-15.945-7.663-38.876-15.836-59.5C266.255,152.886,248.523,130,248.523,130z"/><path fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" d="M226.833,167.549c2.688-5.936,43.033-3.462,43.914-1.495C272.803,170.64,279.5,186,277,180c-2.442-5.86-52.708-2.76-55.087-2.516C221.913,177.484,221.655,178.979,226.833,167.549z"/><ellipse fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" cx="247.5" cy="212.75" rx="23" ry="22"/><ellipse fill="#458BA3" stroke="#000000" stroke-miterlimit="10" cx="247.5" cy="212.75" rx="20.209" ry="18.459"/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="241,253.75 258.5,253.75 249.75,305.75 "/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="204.124,239.5 195,293.5 209.585,264.099 "/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="306,296.25 306,296.25 292.964,240.472 289.006,263.013"/><polygon fill="#515151" stroke="#000000" stroke-miterlimit="10" points="219.252,267.462 216.833,272.5 233.833,275.5 233.833,269.661 "/><polygon fill="#515151" stroke="#000000" stroke-miterlimit="10" points="265.382,268.361 263.5,273.834 280.5,269.661 277.551,266.5 "/><line fill="none" stroke="#000000" stroke-miterlimit="10" x1="253.5" y1="202.125" x2="235.125" y2="210.75"/><line fill="none" stroke="#000000" stroke-miterlimit="10" x1="254.5" y1="207.125" x2="236.125" y2="215.75"/>';
    var ufo = two.interpret(svgUfo).center();
    ufo.rotation = Math.PI/2;
    ufo.translation.y = -111;
    ufo.translation.x = 176;

    var ball = two.makeGroup();
    ball.add(ufo);

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
      ball.remove();
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
      itemTrailCos.elt.noStroke().fill = 'rgba('+colorSin+', 1)';
      itemTrailCos.index = 0;
      itemTrailCos.type = 'cos';
      itemTrailCos.xInit = mouse.x;
      itemTrailCos.x = mouse.x;
      itemTrailCos.y = mouse.y;
      itemTrailCos.z = 1;

      var itemTrailSin = {};
      itemTrailSin.v = new Two.Vector();
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

    nIntervId = setInterval(addTrailItem, frequence);

    two.bind('update', function() {

      delta.copy(mouse).subSelf(ball.translation);

      ball.translation.addSelf(delta);

      ball.rotation = Math.PI/2*(rotation.y/100);

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
          var percent = 1-(itemTrail.xInit-itemTrail.x)/sizeTrail;
          itemTrail.elt.scale = percent*itemTrail.z/2;
          itemTrail.elt.opacity = percent*(itemTrail.z);
          itemTrail.elt.translation.set(itemTrail.x, itemTrail.y);

          itemTrail.index++;
        }
      }
    });
};
