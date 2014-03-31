'use strict';

var mongoose = require('mongoose');

var socketSchema = mongoose.Schema({
    mac: String,
    username: String,
    distance: Number,
    click: Number,
    scroll: Number
});

socketSchema.methods.addDistance = function (distance) {
  this.distance += distance;
  this.save();
};

socketSchema.methods.addScroll = function (scroll) {
  this.scroll += scroll;
  this.save();
};

socketSchema.methods.addClick = function () {
  this.click++;
  this.save();
};

var Socket = mongoose.model('Socket', socketSchema);
exports.Socket = Socket;