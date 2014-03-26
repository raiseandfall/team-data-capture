'use strict';


console.log('Developed with love by frenchies at JVST Inc');

var host = window.document.location.host.replace(/:.*/, ''),
port='9000';
var ws = new Socket();
ws.connect(host, port);

/**********************************
*              Events             *
**********************************/
/**
* onmessage
* also ws.EVENT.MESSAGE
* Call everytime the socket recieve a message from the server
*/
ws.events.addEventListener(ws.EVENT.MESSAGE, function(e) {	
	//console.log('listener: onmessage', e);
});

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
	console.log('listener: welcome', l);
	for(i = 0; i < l; i++){
		ss = new Spaceship(datajson.data[i].id, ws);
	}
});


/**
* mousemove
* also ws.EVENT.MOUSE_MOVE
* Call everytime an action mouse move is sent from the server
**/
ws.events.addEventListener(ws.EVENT.MOUSE_MOVE, function(e) {	
	//console.log('listener: mousemove', e);
});


/**
* click
* also ws.EVENT.CLICK
* Call everytime an action click is sent from the server
*/
ws.events.addEventListener(ws.EVENT.CLICK, function(e) {	
	//console.log('listener: click', e);
});

/**
* mousewheel
* also ws.EVENT.MOUSE_WHEEL
* Call everytime an action mousewheel is sent from the server
*/
ws.events.addEventListener(ws.EVENT.MOUSE_WHEEL, function(e) {	
	//console.log('listener: mousewheel', e);
});

/**
* keypress
* also ws.EVENT.KEY_PRESS
* Call everytime an action keypress is sent from the server
*/
ws.events.addEventListener(ws.EVENT.KEY_PRESS, function(e) {	
	//console.log('listener: keypress', e);
});

/**
* word
* also ws.EVENT.WORD
* Call everytime an action word is sent from the server
*/
ws.events.addEventListener(ws.EVENT.WORD, function(e) {	
	//console.log('listener: word', e);
});

/**
* newuser
* also ws.EVENT.NEW_USER
* Call everytime a new user connect to the server
*/

ws.events.addEventListener(ws.EVENT.NEW_USER, function(e) {	
	var datajson = JSON.parse(e.detail);
	//console.log('listener: ', ws.EVENT.NEW_USER, datajson.data);

	var id = datajson.data.id; 
	//var username = datajson.data.username; 

	var ss = new Spaceship(id, ws);
	/** closeuser_[id]
	* also ws.EVENT.MOUSE_MOVE+'_'+id
	* Call everytime an action mouse move from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.CLOSE_USER+'_'+id, function(e) {	
		var datajson = JSON.parse(e.detail);
		//console.log('listener: ', 'closeuser_'+id, e);
	});

	/** mousemove_[id]
	* also ws.EVENT.MOUSE_MOVE+'_'+id
	* Call everytime an action mouse move from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.MOUSE_MOVE+'_'+id, function(e) {	
		//console.log('listener: ', 'mousemove_'+id, e);
	});

	/** click_[id]
	* also ws.EVENT.CLICK+'_'+id
	* Call everytime an action click from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.CLICK+'_'+id, function(e) {	
		//console.log('listener: ', 'click_'+id, e);
	});

	/** mousewheel_[id]
	* also ws.EVENT.MOUSE_WHEEL+'_'+id
	* Call everytime an action mouse wheel from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.MOUSE_WHEEL+'_'+id, function(e) {	
		//console.log('listener: ', 'mousewheel_'+id, e);
	});

	/** keypress_[id]
	* also ws.KEY_PRESS.CLICK+'_'+id
	* Call everytime an action keypress from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.KEY_PRESS+'_'+id, function(e) {	
		//console.log('listener: ', 'keypress_'+id, e);
	});

	/** word_[id]
	* also ws.EVENT.WORD+'_'+id
	* Call everytime an action word from the socket [id] is sent from the server
	*/
	ws.events.addEventListener(ws.EVENT.WORD+'_'+id, function(e) {	
		//console.log('listener: ', 'word_'+id, e);
	});
});

