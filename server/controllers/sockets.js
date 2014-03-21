var WebSocketServer = require('ws').Server,
Client = require('./client').Client;



/**
 *  Define the Socket Object.
 */
var Socket = function() {
  //  Scope.
  var self = this;

  self.message = function (data, flags) {
    console.log('Client : '+ data);
    datajson = JSON.parse(data);
    console.log('Client : '+ JSON.parse(data).type);
    var data = '{"type": "confirm"}';
    self.sockets[datajson.id].send(data);

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

    var client = new Client(ws);
    // store the new socket in sockets
    self.sockets[self.clientId] = client;

    var data = '{"type": "auth","id": '+self.clientId+'}';
    client.send(data);

    if(ws){
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
