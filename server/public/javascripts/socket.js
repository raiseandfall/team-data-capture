'use strict';

var Socket = (function(WebSocket){
	var EVENT = {
			HELLO: 'hello',
			AUTH: 'auth',
			WELCOME: 'welcome',
			NEW_USER: 'newuser',
			CLOSE_USER: 'closeuser',
			WEB: 'web',
			APP: 'app',
			MOUSE_MOVE: 'mousemove',
			CLICK: 'click',
			KEY_DOWN: 'keydown',
			MOUSE_WHEEL: 'scroll',
			MESSENGER:	'messenger',
			MESSAGE: 'onmessage'
	};
  var onopen = function () {
		console.log('connection open');
	};

	var onmessage = function (data, flags) {
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked

		console.log('--->onmessage',JSON.parse(data.data));

		var datajson = JSON.parse(data.data),
			ev = new CustomEvent(EVENT.MESSAGE, {'detail':data.data}),
			response;
		this.dispatchEvent(ev);


		switch(datajson.type){
			case EVENT.HELLO:
				response = '{"type":"'+EVENT.AUTH+'", "id": "'+datajson.data.id+'", "client": "'+EVENT.WEB+'"}';
				this.send(response);
				break;
			case EVENT.WELCOME:
					ev = new CustomEvent(EVENT.WELCOME, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
			case EVENT.NEW_USER:
					ev = new CustomEvent(EVENT.NEW_USER, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
			case EVENT.CLOSE_USER:
					ev = new CustomEvent(EVENT.CLOSE_USER, {'detail':data.data});
					console.log(EVENT.CLOSE_USER+'_', datajson.data.id);
					ev = new CustomEvent(EVENT.CLOSE_USER+'_'+datajson.data.id, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
			case EVENT.MOUSE_MOVE:
			case EVENT.CLICK:
			case EVENT.KEY_DOWN:
			case EVENT.MOUSE_WHEEL:
			case EVENT.WORD:
					// send a general event for all mousemove
					ev = new CustomEvent(datajson.type, {'detail':data.data});
					this.dispatchEvent(ev);
					// send a specific event for this id
					ev = new CustomEvent(datajson.type+'_'+datajson.id, {'detail':data.data});
					this.dispatchEvent(ev);
				break;
		}
	};

	return function(){
		var self = this;

		this.EVENT = EVENT;

		this.connect = function(host, port){
			this.events = new WebSocket('ws://' + host + ':' + port + '/');

			this.events.onopen = onopen;
			this.events.onmessage = onmessage;
		};
	};

})(WebSocket);
