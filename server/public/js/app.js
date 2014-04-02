'use strict';


console.log('Developed with love by frenchies at JVST Inc');

/**
* Start the Socket connection
*/
var host = window.document.location.host.replace(/:.*/, ''),
port='9000';
var ws = new Socket();
ws.connect(host, port);

/**
* Initialize the Two.js
*/
var type = 'svg';
var two = new Two({
  type: Two.Types[type],
  fullscreen: true,
  autostart: true
}).appendTo(document.body);

/**
* Create the Sky
*/
var sky = new Sky(two);
Two.Resolution = 32;

/**
* Manage the Sound
*/

var audio = document.getElementById('audio'),
    isplaying = true;
audio.volume = 0.4;
audio.loop = true;
audio.play();
/*
var volume = document.getElementById('volume');
volume.addEventListener('click', function(e) {
  if(isplaying){
    audio.pause();
    volume.className = 'btn off';
  }else{
    audio.play();
    volume.className = 'btn on';
  }
  isplaying = !isplaying;
});
*/

/**********************************
*              Events             *
**********************************/

/**
* welcome
* also ws.EVENT.WELCOME
* Call everytime the socket recieve a message from the server
*/
ws.events.addEventListener(ws.EVENT.WELCOME, function(e) {
	var datajson = JSON.parse(e.detail),
		l = datajson.data.length,
		ss,
		i;
	for(i = 0; i<l; i++){
		ss = new Spaceship(datajson.data[i].id, ws, two);
	}
});

/**
* newuser
* also ws.EVENT.NEW_USER
* Call everytime a new user connect to the server
*/

ws.events.addEventListener(ws.EVENT.NEW_USER, function(e) {
	var datajson = JSON.parse(e.detail);
	var id = datajson.data.id;
	var ss = new Spaceship(id, ws, two);
});

ws.events.addEventListener(ws.EVENT.SOUND_OFF, function() {
    audio.pause();
});

ws.events.addEventListener(ws.EVENT.SOUND_ON, function() {
    audio.play();
});

