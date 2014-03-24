var host = window.document.location.host.replace(/:.*/, '');
var ws = new Socket();
ws.connect(host, '9000');

ws.onmessage = function(e) {
	console.log(e.detail);
};