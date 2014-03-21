var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
    socket_id:String,
    session_id:String,
    type: String,
    datas: Array
});


var Session = mongoose.model('Session', sessionSchema);
exports.SessionSchema = Session;