var mongoose = require('mongoose');

var actionSchema = mongoose.Schema({
    mac:String,
    session_id:String,
    type: String,
    data: Object
});


var Action = mongoose.model('Action', actionSchema);
exports.Action = Action;