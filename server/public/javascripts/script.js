'use strict';


console.log('Developed with love by frenchies at JVST Inc');

var host = window.document.location.host.replace(/:.*/, ''),
port='9000';
var ws = new Socket();
ws.connect(host, port);
var ss = new Spaceship();

ws.events.addEventListener('onMessage', function(e) {	
	console.log('listener: onMessage', e);
});
ws.events.addEventListener('onMouseMove', function(e) {	
	console.log('listener: onMouseMove', e);
});