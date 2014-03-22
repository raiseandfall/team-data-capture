var Socket = require('../providers/socket').Socket,
  APP = require('../config.js').APP;
  utils = require('../utils.js');
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
  console.log('welcome');
  this.mac = data.mac;
  this.username = data.username;
  this.saveSocket();
};

Client.prototype.saveSocket = function(){
  var self = this;
  Socket.find({'mac':self.mac}).exec(function(err, sockets){
    if(err) {
      throw new Error(err, 'Creating a Socket: An error has occurred');
    }else{
      if(sockets.length > 0){
        console.log(self.username + ' is back');
        self.saveSessions();
      }else{
        var socket = new Socket({
          username: self.username,
          mac: self.mac
        });
        socket.save(function(err, socket){
          if(err) {
            throw new Error(err, 'Creating a Socket: An error has occurred');
          }else{
            console.log(self.username + ' has been saved');
            self.saveSessions();
          }
        });
      }
    }
  });
};
Client.prototype.saveSessions = function(){
  var response = '{"type":"'+APP.TYPE.WELCOME+'"}',
    self = this,
    nbActions = utils.sizeof(APP.ACTION);  

  console.log('nbActions:'+nbActions)
  self.send(response);
}

Client.prototype.saveSession = function(index){
  var response = '{"type":"'+APP.TYPE.WELCOME+'"}',
    self = this;  
  self.send(response);
}

Client.prototype.send = function(data){
  console.log('send : '+data);
  this.ws.send(data);
};


exports.Client = Client;
