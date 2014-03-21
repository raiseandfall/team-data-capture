var mongoose = require('mongoose');

var socketSchema = mongoose.Schema({
    macaddress: String,
    username: String,
    email: String
});


var Socket = mongoose.model('Socket', socketSchema);
exports.SocketSchema = Socket;