'use strict';

var httpRequest,
  stats;


function alertContents() {
  if (httpRequest.readyState === 4) {
    if (httpRequest.status === 200) {
      console.log(httpRequest.responseText);
      stats.display(httpRequest.responseText);
    } else {
      console.log('There was a problem with the request.');
    }
  }
}

function makeRequest(url) {
  if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    httpRequest = new XMLHttpRequest();
  } else if (window.ActiveXObject) { // IE
    try {
      httpRequest = new ActiveXObject('Msxml2.XMLHTTP');
    } 
    catch (e) {
      try {
        httpRequest = new ActiveXObject('Microsoft.XMLHTTP');
      } 
      catch (e) {}
    }
  }

  if (!httpRequest) {
    console.log('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = alertContents;
  httpRequest.open('GET', url);
  httpRequest.send();
}

var Stats = function(){
  var self = this;
  this.header = document.getElementsByTagName('header')[0];
  this.btn = document.getElementById('stats');
  this.overlay = document.getElementById('overlay'); 
  this.close = document.getElementById('close'); 

  this.intervalId = 0;
  this.currentClass = 0;
  this.aClass = ['distance', 'click', 'scroll'];

  this.btn.addEventListener('click', function(){
    self.overlay.className = '';
    self.header.className = '';
    setTimeout(function(){
      self.overlay.className = 'visible';
    }, 100);
    setTimeout(function(){
      self.header.className = 'hide';
    }, 500);
    makeRequest('/socket/all/');
  });

  this.close.addEventListener('click', function(){
    self.overlay.className = '';
    self.header.className = '';
    clearInterval(this.intervalId);
    setTimeout(function(){
      self.overlay.className = 'hide';
    }, 500);
    setTimeout(function(){
      self.header.className = 'visible';
    }, 100);
  });
};

Stats.prototype.display = function(data){
  var self = this,
    datajson = JSON.parse(data),
    l = datajson.data.length,
    table = this.overlay.getElementsByTagName('table'),
    content = '<tr><td>username</td><td class="distance active">distance</td><td class="click">click</td><td class="scroll">scroll</td></tr>',
    i, item;
  if(datajson.type === 'socket'){
    for(i = 0; i<l; i++){
      content += '<tr><td>'+datajson.data[i].username+'</td><td class="distance active">'+Math.round(datajson.data[i].distance*0.083333/150)+' ft</td><td class="click">'+datajson.data[i].click+'</td><td class="scroll">'+Math.round(datajson.data[i].scroll*0.083333/150)+' ft</td></tr>';
    }
    table[0].innerHTML = content;
    this.intervalId = setInterval(function(){
      var elements = table[0].getElementsByClassName(self.aClass[self.currentClass]);
      for(i = 0; i<elements.length; i++){
        elements[i].className = self.aClass[self.currentClass];
      }
      self.currentClass ++;
      if(self.currentClass>=self.aClass.length){
        self.currentClass = 0;
      }
      elements = table[0].getElementsByClassName(self.aClass[self.currentClass]);
      for(i = 0; i<elements.length; i++){
        elements[i].className = self.aClass[self.currentClass]+' active';
      }
    },5000);
  }

};

stats = new Stats();
