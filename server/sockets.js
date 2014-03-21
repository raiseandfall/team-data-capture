var WebSocketServer = require('ws').Server;



/**
 *  Define the Socket Object.
 */
var Socket = function() {
  //  Scope.
  var self = this;

  self.message = function (data, flags) {
    console.log('Client : '+ data);
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

    // store the new socket in sockets
    self.sockets[self.clientId] = ws;

    var data = {
      "type": "id",
      "id": self.clientId
    }
    ws.send(data);

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

/**
 *  Define the Socket Object.
 */
var Client = function(ws) {
  this.ws = ws;
};

exports.Socket = Socket;
