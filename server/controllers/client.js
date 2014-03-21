var Socket = require('../providers/socket').Socket,
  APP = require('../config.js').APP;
/**
 *  Define the Socket Object.
 */
var Client = function(ws) {
  this.ws = ws;
};
/**
* set the username of the  
*/

Client.prototype.sayHello = function(id){
  var data = '{"type": "hello","data":{"id": '+id+'}}';
  this.id = id;
  this.send(data);
};

Client.prototype.welcome = function(data){
  var response = '{"type":"'+APP.TYPE.WELCOME+'"}';
  this.mac = data.mac;
  this.username = data.username;
  this.send(response, this.save);
};

Client.prototype.send = function(data){
  this.ws.send(data);
};

Client.prototype.save = function(response, fn){
  var self = this;

  Socket.find({'mac':this.mac}).exec(function(err, sockets){
    if(err) {
      throw new Error(err, 'Creating a Socket: An error has occurred');
    }else{
      if(sockets.length > 0){
        fn(response);
      }else{
        var socket = new Socket({
          username: this.username,
          email: this.email
        });
        socket.save(function(err, socket){
          if(err) {
            throw new Error(err, 'Creating a Socket: An error has occurred');
          }else{
            fn(response);
          }
        });
      }
    }
  });
};

exports.Client = Client;
