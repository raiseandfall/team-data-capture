'use strict';

var Socket = (function(WebSocket){
	var APP = {
		TYPE: {
			HELLO: 'hello',
			AUTH: 'auth',
			WELCOME: 'welcome',
			NEW_USER: 'newuser'
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
		},
		EVENTS: {
			ON_MESSAGE: 'onMessage',
			ON_MOUSE_MOVE: 'onMouseMove',
			ON_NEW_USER: 'onNewUser'
		}
	};
  var onopen = function () {
		console.log('connection open');
	};

	var onmessage = function (data, flags) {
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked

		var datajson = JSON.parse(data.data),
			ev = new CustomEvent(APP.EVENTS.ON_MESSAGE, {'detail':data.data}),
			response;
		this.dispatchEvent(ev);

		switch(datajson.type){
			case APP.TYPE.HELLO:
				response = '{"type":"'+APP.TYPE.AUTH+'", "id": "'+datajson.data.id+'", "client": "'+APP.CLIENT.WEB+'"}';
				this.send(response);
				break;
			case APP.TYPE.NEW_USER:
					ev = new CustomEvent(APP.EVENTS.ON_NEW_USER, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
			case APP.ACTION.MOUSE_MOVE:
					ev = new CustomEvent(APP.EVENTS.ON_MOUSE_MOVE, {'detail':data.data});
					this.dispatchEvent(ev);
					ev = new CustomEvent(APP.EVENTS.ON_MOUSE_MOVE+'.'+datajson.data.id, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
		}
	};

	return function(){
		var self = this;

		this.APP = APP;

		this.connect = function(host, port){
			this.events = new WebSocket('ws://' + host + ':' + port + '/');

			this.events.onopen = onopen;
			this.events.onmessage = onmessage;



			this.events.addEventListener(APP.EVENTS.ON_MESSAGE, function(e) { self.onmessage(e); });
		};

		this.onmessage = function(e){
			console.log('onmessage', e.detail);
		};
		this.mousemove = function(e){
			console.log('mousemove', e.detail);
		};
	};

})(WebSocket);
