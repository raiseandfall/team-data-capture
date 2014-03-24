"use strict"

var Socket = (function(WebSocket){
	var APP = {
		TYPE: {
			HELLO: 'hello',
			AUTH: 'auth',
			WELCOME: 'welcome'
		},
		CLIENT: {
			WEB: 'web',
			APP: 'app',
		},
		ACTION:{
			MOUSE_MOVE: 'mousemove',
			CLICK: 'click',
			KEY_DOWN: 'keydown',
			MOUSE_WHEEL: 'mousewheel',
			WORD:	'word'
		}	
	};

	var onopen = function () {
		console.log('onopen 2');
	};

	var onmessage = function (data, flags) {
	    // flags.binary will be set if a binary data is received
	    // flags.masked will be set if the data was masked

	  var datajson = JSON.parse(data.data),
	  	ev = new CustomEvent("onmessage", {"detail":data.data}),
			response;
		this.dispatchEvent(ev);

		switch(datajson.type){
			case APP.TYPE.HELLO:
				response = '{"type":"'+APP.TYPE.AUTH+'", "id": "'+datajson.data.id+'", "client": "'+APP.CLIENT.WEB+'"}'
	    	this.send(response);
				break;
		}
	};

	return function(){
		var self = this;

		this.connect = function(host, port){
			this.ws = new WebSocket('ws://' + host + ':' + port + '/');

			this.ws.onopen = onopen;
			this.ws.onmessage = onmessage;

			this.ws.addEventListener("onmessage", function(e) {	self.onmessage(e); });
		}

		this.onmessage = function(e){
			console.log('onmessage', e.detail);
		}
	};

})(WebSocket);
