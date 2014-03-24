//var host = window.document.location.host.replace(/:.*/, '');
/*var ws = new WebSocket('ws://' + host + ':9000/');

ws.onopen = function(){
	console.log('onopen');
};
ws.onmessage = function(data, flags) {
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
	console.log('onmessage', data.data);
  var datajson = JSON.parse(data.data);
	switch(datajson.type){
		case 'hello':
			response = '{"type":"webauth", "id": "'+datajson.data.id+'"}'
    	ws.send(response);
			break;
	}
};*/

var Socket = (function(WebSocket){
	var APP = {
		TYPE: {
			HELLO: 'hello',
			AUTH: 'auth',
			WEBAUTH: 'webauth',
			WELCOME: 'welcome'
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

	  var datajson = JSON.parse(data.data);

		var event = new CustomEvent("onmessage", {"detail":data.data});
		this.dispatchEvent(event);

		switch(datajson.type){
			case APP.TYPE.HELLO:
				response = '{"type":"webauth", "id": "'+datajson.data.id+'"}'
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
