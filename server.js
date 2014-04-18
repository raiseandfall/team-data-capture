#!/bin/env node
/**
 *  main():  Main code.
 */
var config = require('./config.js');

var TeamCaptureApp = require('./app').TeamCaptureApp;
var app = new TeamCaptureApp(config.ipaddress, config.port, config.db_name);
app.initialize();
app.start();