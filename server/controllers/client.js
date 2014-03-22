var Socket = require('../providers/socket').Socket,
  Session = require('../providers/session').Session,
  Action = require('../providers/action').Action,
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
    self = this;

  var session = new Session({
    mac: self.mac
  });
  session.save(function(err, session){
    if(err) {
      throw new Error(err, 'Creating a Session: An error has occurred');
    }else{
      console.log(self.username + ' just started a new session '+session);
      self.session_id = session._id
      self.send(response);
    }
  });
}

Client.prototype.saveAction = function(data){
  var self = this;

  var action = new Action({
    mac: self.mac,
    type: data.type,
    data: data.data
  });
  action.save(function(err, action){
    if(err) {
      throw new Error(err, 'Creating a Action: An error has occurred');
    }else{
      //console.log(self.username + ' just did a new action '+data.type);
    }
  });

  Session.findOne({'_id':self.session_id}).exec(function(err, session){
    if(err){
      throw new Error(err, 'Creating a Action: An error has occurred when retrieving the Session');
    }else{
      session.addAction(data);
    }
  });
}


Client.prototype.send = function(data){
  console.log('send : '+data);
  this.ws.send(data);
};


exports.Client = Client;
