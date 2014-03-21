var mongoose = require('mongoose');

var actionSchema = mongoose.Schema({
    socket_id:String,
    session_id:String,
    type: String,
    data: Object
});


var Action = mongoose.model('Action', actionSchema);
exports.ActionSchema = Action;