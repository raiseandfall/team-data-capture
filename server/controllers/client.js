var Socket = require('../providers/socket').Socket;
/**
 *  Define the Socket Object.
 */
var Client = function(id, ws) {
  this.id = ''; // id in mongodb
  this.clientId = id; // id of the client 
  this.ws = ws;
};
/**
* set the username of the  
*/
Client.prototype.setUsername = function(s){
  this.username = s?s:'';
};

Client.prototype.setMacaddress = function(s){
  this.macaddress = s?s:'';
};

Client.prototype.send = function(data){
  this.ws.send(data);
};

Client.prototype.save = function(data, fn){
  this.ws.send(data);

  var socket = new Socket({
    username: this.username,
    email: this.email
  });

  socket.save(function(err, socket){
    if(err) {
      throw new Error(err, 'Creating a Socket: An error has occurred');
    }else{
      fn(socket.id);
    }
  });
};

exports.Client = Client;
