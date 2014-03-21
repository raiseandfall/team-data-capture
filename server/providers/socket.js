var mongoose = require('mongoose');

var socketSchema = mongoose.Schema({
    mac: String,
    username: String
});


var Socket = mongoose.model('Socket', socketSchema);
exports.Socket = Socket;