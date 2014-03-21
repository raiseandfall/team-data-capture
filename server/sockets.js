var WebSocketServer = require('ws').Server;



/**
 *  Define the Socket Object.
 */
var Socket = function() {
  //  Scope.
  var self = this;

  self.message = function (data, flags) {
    console.log('Client #%d : %s', self._clientId, data);
  };
  
  self.close = function () {
    console.log('Client #%d disconnected', self._clientId);
  };

  self.error = function (e) {
    console.log('Client #%d error: %s', e.message);
  };

  /**
   *  First Connections
   */
  self.connection = function(ws) {
    self.clientId++;
    console.log('Client connected !');
    var remoteAddress = ws?ws._socket.remoteAddress:'';
    if(ws){
      console.log('Client #%d: ', self._clientId,remoteAddress);
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
    self.wss = new WebSocketServer( { server: app } );

    self.wss.on('connection', self.connection );
  };
};

exports.Socket = Socket;