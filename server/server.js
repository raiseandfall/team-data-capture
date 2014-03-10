/**
 * @file        server.js
 * @author      Matthieu COLLE <hello.matthieu.colle@gmail.com>
 * @description https://github.com/raiseandfall/team-data-capture
 * @license     MIT
 */

var config = {
  port: 9000,
  address: 'localhost'
};

var processRequest = function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/json'});
  res.end(tpl);
};

var http = require('http'),
    WebSocketServer = require('ws').Server,
    fs = require('fs'),
    wss,
    hbs = require('handlebars'),
    clientId = 0,
    aClients = [],
    tpl = fs.readFileSync('./index.html', 'utf8'),
    app;

app = http.createServer(processRequest).listen(config.port, config.address);
wss = new WebSocketServer( { server: app } );


wss.on('connection', function (ws) {
  var _clientId = clientId++;

  console.log('Client #%d connected !', _clientId, ws._socket.remoteAddress);

  // If client already exists
  var cli = new Client( _clientId, ws._socket.remoteAddress );

  if (cli === true) {
    // On message
    ws.on('message', function (data, flags) {
      console.log('Client #%d : %s', _clientId, data);
    });

    // Client disconnected
    ws.on('close', function () {
      console.log('Client #%d disconnected', _clientId);

      // Unbind events
      ws.off('message');
      ws.off('close');
      ws.off('error');

      cli.disconnect( _clientId );
    });

    // Client error
    ws.on('error', function (e) {
      console.log('Client #%d error: %s', thisId, e.message);
    });
  }
});



// Client
var Client = function (_id, _ip) {
  this.ID = _id;
  this.IP_ADDRESS = _ip;

  aClients.push({
    id: _id,
    ip: _ip
  });
};
Client.prototype.getId = function () {
  return this.ID;
};
Client.prototype.disconnect = function (_id) {
  var numClients = aClients.length;
  for (var c=0; c < numClients; c++) {
    if (_id === aClients[c].id) {
      aClients.splice(c, 1);
      return true;
    }
  }
};
