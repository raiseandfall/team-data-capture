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
    switch(datajson.type){
      case APP.TYPE.AUTH:
        console.log('Client : '+ data);
        client.welcome(datajson.data, datajson.client);
        if(datajson.client = APP.CLIENT.WEB){
          self.websockets.push(client);
        }
        break;
      case APP.ACTION.MOUSE_MOVE:
      case APP.ACTION.CLICK:
      case APP.ACTION.KEY_DOWN:
      case APP.ACTION.MOUSE_WHEEL:
      case APP.ACTION.WORD:
        client.saveAction(datajson);
        for (ws in self.websockets){
          ws.send(data);
        }
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
    self.websockets = [];
    self.wss = new WebSocketServer( { server: app } );
    self.wss.on('connection', self.connection );
  };
};

exports.Socket = Socket;
