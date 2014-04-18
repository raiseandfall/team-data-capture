'use strict';

var Socket = require('../providers/socket').Socket,
  APP = require('../constants.js').APP;
/**
 *  Define the Socket Object.
 */
var Client = function (ws) {
    this.ws = ws;
};
/**
* set the username of the  
*/

Client.prototype.sayHello = function (id) {
  var data = '{"type": "hello","data":{"id": ' + id + '}}';
  this.id = id;
  this.send(data);
};

Client.prototype.welcome = function (data, type_client, sockets) {
  var l = sockets.length,
    ids = '',
    response, i;
  console.log('welcome');

  this.type = type_client;

  switch (type_client) {
  case APP.CLIENT.APP:
    this.mac = data.mac;
    this.username = data.username;
    this.saveSocket();
    break;
  case APP.CLIENT.WEB:
    for (i=0; i<l;i++){
      if(sockets[i]&&sockets[i].type === APP.CLIENT.APP){
        ids += ids!=='' ? ',' : '';
        ids += '{ "id":"'+sockets[i].id+'",';
        ids += ' "username":"'+sockets[i].username+'"}';
      }
    }
    response = '{"type":"' + APP.TYPE.WELCOME + '", "data": ['+ids+']}';
    this.send(response);
    break;
  }
};

Client.prototype.saveSocket = function(){
  var response = '{"type":"'+APP.TYPE.WELCOME+'"}',
    self = this;
  Socket.find({'mac':self.mac}).exec(function(err, sockets){
    if(err) {
      throw new Error(err, 'Creating a Socket: An error has occurred');
    }else{
      if(sockets.length > 0){
        console.log(self.username + ' is back');
        self.send(response);
      }else{
        var socket = new Socket({
          username: self.username,
          mac: self.mac,
          distance: 0,
          click: 0,
          scroll: 0
        });
        socket.save(function(err){
          if(err) {
            throw new Error(err, 'Creating a Socket: An error has occurred');
          }else{
            console.log(self.username + ' has been saved');
            self.send(response);
          }
        });
      }
    }
  });
};

Client.prototype.saveAction = function(data){

  var self = this;
  Socket.findOne({'mac':self.mac}).exec(function(err, socket){
    if(err) {
      throw new Error(err, 'Creating a Socket: An error has occurred');
    }else{
      var distance;
      switch(data.type){
        case APP.ACTION.MOUSE_MOVE:
          distance = Math.sqrt(Math.pow(data.data.delta.x,2)+Math.pow(data.data.delta.y,2));
          socket.addDistance(distance);
          break;
        case APP.ACTION.CLICK:
          socket.addClick();
          break;
        case APP.ACTION.MOUSE_WHEEL:
          socket.addScroll(Math.abs(data.data.delta.y));
          break;
      }
    }
  });
};


Client.prototype.send = function(data){
  this.ws.send(data);
};


exports.Client = Client;
