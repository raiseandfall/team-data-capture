var WebSocketServer = require('ws').Server,
    clientId = 0,
    wss;
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
          /*ws.off('message');
          ws.off('close');
          ws.off('error');*/

          //cli.disconnect( _clientId );
        });

        // Client error
        ws.on('error', function (e) {
          console.log('Client #%d error: %s', e.message);
        });
      //}
    });
};