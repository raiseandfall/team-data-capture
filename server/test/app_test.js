'use strict';

var TeamCaptureApp = require('../app').TeamCaptureApp,
    Socket = require('../controllers/sockets').Socket,
    app = new TeamCaptureApp(4000),
    socket = new Socket(),
    events = require('events'),
    idLog = 0,
    APP = require('../constants.js').APP;

exports['read ipaddress'] = function (test) {
		app.initialize();
    test.equal(app.ipaddress, '192.168.173.103');
    test.done();
};

exports['start server'] = function (test) {
	app.start();
	console.log = function (str) {
		switch(idLog){
			case 0:
				test.equal(str, '%s: Node server started on %s:%d ...');
				break;
			case 1:
				test.equal(str, 'Connected to teamcapture DB');
				test.done();
				break;
			default:
				test.done();
				break;
		}
		idLog ++;
	};
};

exports['connect socket'] = function (test) {
	var ev = new events.EventEmitter();
  
  socket.initialize(app.server);

	console.log = function (str) {
		test.equal(str, 'Client #1 connected !');
		test.done();
	};
	socket.connection();
};


exports['message socket'] = function (test) {

	console.log = function (str) {
		test.equal(str, 'Client : {"type":"mousemove"}');
		test.done();
	};
	socket.message('{"type":"'+APP.ACTION.MOUSE_MOVE+'"}');

};