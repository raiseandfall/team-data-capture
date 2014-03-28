'use strict';
var Ship = function(two){
  var self = this,
      ufo1 = {'svg':'<path fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" d="M248.523,130c0,0-16.417,22.479-27.523,49.5c-12.93,31.459-20.608,68.755-16.973,78.933c6.757,18.919,92.406,10.433,89.189,0c1.064-2.704,0.899-9.63-0.38-18.933c-2.193-15.945-7.663-38.876-15.836-59.5C266.255,152.886,248.523,130,248.523,130z"/><path fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" d="M226.833,167.549c2.688-5.936,43.033-3.462,43.914-1.495C272.803,170.64,279.5,186,277,180c-2.442-5.86-52.708-2.76-55.087-2.516C221.913,177.484,221.655,178.979,226.833,167.549z"/><ellipse fill="#FFFFFF" stroke="#000000" stroke-miterlimit="10" cx="247.5" cy="212.75" rx="23" ry="22"/><ellipse fill="#458BA3" stroke="#000000" stroke-miterlimit="10" cx="247.5" cy="212.75" rx="20.209" ry="18.459"/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="241,253.75 258.5,253.75 249.75,305.75 "/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="204.124,239.5 195,293.5 209.585,264.099 "/><polygon fill="#C90000" stroke="#000000" stroke-miterlimit="10" points="306,296.25 306,296.25 292.964,240.472 289.006,263.013"/><polygon fill="#515151" stroke="#000000" stroke-miterlimit="10" points="219.252,267.462 216.833,272.5 233.833,275.5 233.833,269.661 "/><polygon fill="#515151" stroke="#000000" stroke-miterlimit="10" points="265.382,268.361 263.5,273.834 280.5,269.661 277.551,266.5 "/><line fill="none" stroke="#000000" stroke-miterlimit="10" x1="253.5" y1="202.125" x2="235.125" y2="210.75"/><line fill="none" stroke="#000000" stroke-miterlimit="10" x1="254.5" y1="207.125" x2="236.125" y2="215.75"/>',
              'x':176,
              'y':-108,
              'rotation':Math.PI/2
             },
      ufo2 = {'svg':'<path fill="#FFFFFF" stroke="#010101" stroke-miterlimit="10" d="M304.022,167.46c0,0-12.801,22.479-21.461,49.5c-10.084,31.412-16.07,68.801-13.234,78.933c5.269,18.919,72.052,10.433,69.543,0c0.83-2.704,0.701-9.63-0.296-18.933c-1.71-15.945-5.976-38.876-12.348-59.5C317.849,190.346,304.022,167.46,304.022,167.46z"/><path fill="#ED2025" stroke="#010101" stroke-miterlimit="10" d="M284.427,212.439c5.238,0,5.245,0.084,39.147-2.808c0,0-16.294-41.544-19.398-42.171C301.075,166.833,284.427,212.439,284.427,212.439z"/><polygon fill="#ED2025" stroke="#010101" stroke-miterlimit="10" points="296.5,211.814 296.5,236.454 278.449,233.269 284.427,212.439 "/><path fill="#ED202B" stroke="#010101" stroke-miterlimit="10" d="M316.835,235.148c1.291-0.647,14.173-0.388,14.173-0.388s-3.663-19.496-7.434-25.129c-1.387,0.058-11.692,0.671-11.692,0.671S316.492,236.303,316.835,235.148z"/><polygon fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" points="316.835,235.148 319.001,258.089 297.166,260.04 296.481,235.674 "/><polygon fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" points="296.528,260.472 272.344,257.46 269.275,277.75 297.263,282 "/><path fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" d="M319.305,257.5c0,0,15.08-2.704,16.205-1.414s2.245,12.713,2.45,15.702s-17.188,8.712-17.188,8.712L319.305,257.5z"/><path fill="#ED202B" stroke="#010101" stroke-miterlimit="10" d="M330.662,209.631"/><path fill="#ED202B" stroke="#010101" stroke-miterlimit="10" d="M344.281,249.438"/><path fill="#ED202B" stroke="#010101" stroke-miterlimit="10" d="M333.848,247.75"/><path fill="#ED202B" stroke="#010101" stroke-miterlimit="10" d="M317.591,248.41"/><path fill="#ED2025" stroke="#010101" stroke-miterlimit="10" d="M269.275,277.75c0,14-2.292,7.335,0.646,19.671c16.829,21.329,68.041,1.915,68.041,1.915s3.288-7.836,0-26.336C307.5,287.791,269.44,277.507,269.275,277.75z"/><path fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" d="M356.679,274.209c0,0-5.568,8.054-9.335,17.736c-4.385,11.272-6.988,24.635-5.756,28.282c2.292,6.778,31.339,3.738,30.248,0c0.36-0.969,0.305-3.451-0.129-6.784c-0.744-5.713-2.599-13.929-5.371-21.319C362.692,282.409,356.679,274.209,356.679,274.209z"/><path fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" d="M249.971,272.729c0,0-5.568,8.054-9.335,17.736c-4.385,11.272-6.988,24.635-5.756,28.282c2.292,6.778,31.339,3.738,30.248,0c0.36-0.969,0.305-3.451-0.129-6.784c-0.744-5.713-2.599-13.929-5.371-21.319C255.984,280.93,249.971,272.729,249.971,272.729z"/><polygon fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" points="268.424,282 259.628,289.645 264.999,310.963 273.5,301.5"/><polygon fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" points="339.424,279.5 349.044,289.212 342.281,306.424 337.962,298.336 "/><path fill="#EE1F33" stroke="#010101" stroke-miterlimit="10" d="M306.742,274.209c0,0-5.568,8.054-9.335,17.736c-4.385,11.272-6.988,24.635-5.756,28.282c2.292,6.778,31.339,3.738,30.248,0c0.36-0.969,0.305-3.451-0.129-6.784c-0.744-5.713-2.599-13.929-5.371-21.319C312.756,282.409,306.742,274.209,306.742,274.209z"/>',
              'x':90,
              'y':0,
              'rotation':Math.PI/2
            },
      ufo3 = {'svg':'<ellipse fill="#AADCEA" stroke="#010101" stroke-miterlimit="10" cx="304.928" cy="384.517" rx="40.736" ry="36.978"/><path fill="#4D6369" stroke="#010101" stroke-miterlimit="10" d="M215.596,415.051c0,0,104.817,26.49,182-7.775l-53.36-27.456l-79.089,0.327L215.596,415.051z"/><ellipse fill="#DAE8AB" stroke="#010101" stroke-miterlimit="10" cx="249.076" cy="412.104" rx="7.623" ry="5.392"/><ellipse fill="#DEEAAC" stroke="#010101" stroke-miterlimit="10" cx="356.623" cy="407.711" rx="7.623" ry="5.393"/><ellipse fill="#DEEAAC" stroke="#010101" stroke-miterlimit="10" cx="323.273" cy="413.104" rx="7.623" ry="5.391"/><ellipse fill="#DEEAAC" stroke="#010101" stroke-miterlimit="10" cx="287.063" cy="413.104" rx="7.623" ry="5.391"/><polygon fill="#DEEAAC" stroke="#010101" stroke-miterlimit="10" points="256.698,422.095 262.345,444.539 270.196,424.819 "/><polygon fill="#DEEAAC" stroke="#010101" stroke-miterlimit="10" points="336.572,423.721 352.451,421.494 349.42,444.539 "/><line fill="none" stroke="#010101" stroke-miterlimit="10" x1="311.314" y1="372.488" x2="301.876" y2="352.41"/><line fill="none" stroke="#010101" stroke-miterlimit="10" x1="320.37" y1="372.488" x2="310.932" y2="352.41"/>',
             'x':0,
             'y':-200,
             'rotation':0
           },
      ufos = [ufo1, ufo2, ufo3];

  var new_ufo = ufo1,//ufos[Math.floor((Math.random()*ufos.length))],
      xmlns = 'http://www.w3.org/2000/svg',
      svgUfo = document.createElementNS(xmlns, 'svg');

  svgUfo.innerHTML = new_ufo.svg;

  var ufo = two.interpret(svgUfo).center();
  ufo.rotation = new_ufo.rotation;
  ufo.translation.y = new_ufo.y;
  ufo.translation.x = new_ufo.x;

  var fire = this.fire = two.makeCircle(0, 0 , 50);
  fire.fill = fire.stroke = '#FFFFFF';//'#FF8000';
  fire.opacity = 0.5;
  fire.scale = 0;
  for (var i = 0; i < fire.vertices.length; i++) {
    var v = fire.vertices[i];
    v.originalX = v.x;
  }
  var fire2 = this.fire2 = two.makeCircle(0, 0 , 20);
  fire2.fill = fire2.stroke = '#FFFFFF';//'#ff5a00';
  fire2.opacity = 0.5;
  fire2.scale = 0;
  for (var i = 0; i < fire2.vertices.length; i++) {
    var v = fire2.vertices[i];
    v.originalX = v.x;
  }
  var reactor = two.makeGroup(fire,fire2);

  var ship = this.ship = two.makeGroup(reactor,ufo);

  two.bind('update', function() {

    if(fire.scale>0){
      fire.scale -= 0.01;
      fire2.scale -= 0.01;

      for (var i = 0; i < fire.vertices.length; i++) {
        var v = fire.vertices[i];
        if(v.x < 0){
          var rand = Math.floor((Math.random()*50)+1);
          v.x = v.originalX - rand;

          var v2 = fire2.vertices[i];
          v2.x = v2.originalX - rand;
        }
      }
    }
  });
}

Ship.prototype = {
    getShip : function(){
      return this.ship;
    },

    startWheeling : function(){
      if(this.fire.scale<1){
        this.fire.scale += 0.04;
        this.fire2.scale += 0.04;
      }
    }

};
