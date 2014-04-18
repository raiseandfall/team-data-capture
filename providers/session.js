'use strict';

var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
    mac:String,
    session_id:String,
    type: String,
    datas: Array
});


sessionSchema.methods.addAction = function (action) {
  // we add the id of the tone in the station
  this.datas.push(action);
  this.save();
  //console.log('action added to session');
};

var Session = mongoose.model('Session', sessionSchema);
exports.Session = Session;