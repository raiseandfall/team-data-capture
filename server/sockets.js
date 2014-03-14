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
    console.log('Client #%d connected !', self._clientId, ws._socket.remoteAddress);

    ws.on('message', self.message);
    ws.on('close', self.close);
    ws.on('error', self.error);
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
/*
module.exports = function(app) {
    wss = new WebSocketServer( { server: app } );

    wss.on('connection', function (ws) {
      var _clientId = clientId++;

      console.log('Client #%d connected !', _clientId, ws._socket.remoteAddress);

      // If client already exists
      //var cli = new Client( _clientId, ws._socket.remoteAddress );

      //if (cli === true) {
        // On message
        ws.on('message', function (data, flags) {
          console.log('Client #%d : %s', _clientId, data);
        });

        // Client disconnected
        ws.on('close', function () {
          console.log('Client #%d disconnected', _clientId);

          // Unbind events

          //cli.disconnect( _clientId );
        });

        // Client error
        ws.on('error', function (e) {
          console.log('Client #%d error: %s', e.message);
        });
      //}
    });
};*/