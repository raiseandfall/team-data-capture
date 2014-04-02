'use strict';

var WebSocketServer = require('ws').Server,
  Client = require('./client').Client,
  APP = require('../constants.js').APP;

/**
 *  Define the Socket Object.
 */
var Socket = function() {
  //  Scope.
  var self = this;

  self.message = function (data) {
    var datajson = JSON.parse(data),
      client = self.sockets[datajson.id],
      response,
      i;
    switch(datajson.type){
      case APP.TYPE.AUTH:

        client.welcome(datajson.data, datajson.client, self.sockets);
        if(datajson.client === APP.CLIENT.WEB){
          self.websockets.push(client);
        }
        if(datajson.client === APP.CLIENT.APP){
          response = '{"type":"'+APP.TYPE.NEW_USER+'", "data":{"id":"'+datajson.id+'", "username":"'+datajson.data.username+'"}}';
          for (i = 0; i<self.websockets.length; i++){
            self.websockets[i].send(response);
          }
        }
        break;
      case APP.ACTION.MOUSE_MOVE:
      case APP.ACTION.CLICK:
      case APP.ACTION.KEY_DOWN:
      case APP.ACTION.MOUSE_WHEEL:
      case APP.ACTION.MESSENGER:
        client.saveAction(datajson);
        for (i = 0; i<self.websockets.length; i++){
          self.websockets[i].send(data);
        }
        break;
    }
  };

  self.close = function () {
    var weblength=self.websockets.length,
      applength=self.sockets.length,
      i,
      j,
      response;
    for (i = 0; i<weblength; i++){
      if(self.websockets[i].ws === this) {
        self.websockets.splice(i, 1);
        console.log('Client #%d disconnect', i);
        return;
      }
    }
    for (i = 0; i<applength; i++){
      if(self.sockets[i]){
        if((self.sockets[i].ws === this)&&(self.sockets[i].type === APP.CLIENT.APP)) {
          console.log('close', self.sockets[i].username);
          response = '{"type":"'+APP.TYPE.CLOSE_USER+'", "data":{"id":"'+self.sockets[i].id+'", "username":"'+self.sockets[i].username+'"}}';
          for (j = 0; j<self.websockets.length; j++){
            self.sockets[i] = null;
            self.websockets[j].send(response);
          }
          return;
        }
      }
    }
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
