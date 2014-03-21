var WebSocketServer = require('ws').Server,
  Client = require('./client').Client,
  APP = require('../config.js').APP;

/**
 *  Define the Socket Object.
 */
var Socket = function() {
  //  Scope.
  var self = this;

  self.message = function (data) {
    var datajson = JSON.parse(data),
      client = self.sockets[datajson.id];
        console.log('Client : '+ data);
    switch(datajson.type){
      case APP.TYPE.AUTH:
        client.welcome(datajson.data);
        break;
    }
  };

  self.close = function () {
    console.log('Client #%d disconnected', self.clientId);
  };

  self.error = function (e) {
    console.log('Client #%d error: %s', e.message);
  };

  /**
   *  First Connections
   */
  self.connection = function(ws) {
    self.clientId++;

    console.log('Client #'+self.clientId+' connected !');

    if(ws){
      var client = new Client(ws);
      // store the new socket in sockets
      self.sockets[self.clientId] = client;

      client.sayHello(self.clientId);

      ws.on('message', self.message);
      ws.on('close', self.close);
      ws.on('error', self.error);
    }
  };

  /**
   *  Initializes the socket
   */
  self.initialize = function(app) {
    self.clientId = 0;
    self.sockets = [];
    self.wss = new WebSocketServer( { server: app } );
    self.wss.on('connection', self.connection );
  };
};

exports.Socket = Socket;
