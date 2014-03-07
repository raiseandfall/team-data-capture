/**
 * @file        server.js
 * @author      Matthieu COLLE <hello.matthieu.colle@gmail.com>
 * @description https://github.com/raiseandfall/team-data-capture
 * @license     MIT
 */

var config = {
  port: 9000
};

var app = require('http').createServer(processRequest),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer( { server: app} ),
    clientId = 0;

app.listen(config.port);

var processRequest = function( req, res ) {
  res.writeHead(200);
  res.end("All glory to WebSockets!\n");
};

wss.on('connection', function(ws) {
  var _clientId = clientId++;

  console.log('Client #%d connected !', _clientId);

  // On message
  ws.on('message', function(data, flags) {
    console.log('Client #%d : %s', _clientId, data);
  });

  ws.send('something');

  // Client disconnected
  ws.on('close', function() {
    console.log('Client #%d disconnected', _clientId);
  });

  ws.on('error', function(e) {
    console.log('Client #%d error: %s', thisId, e.message);
  });
});
