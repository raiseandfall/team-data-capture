
/**
 *  main():  Main code.
 */
var TeamCaptureApp = require('./app').TeamCaptureApp;
var app = new TeamCaptureApp(9000);
app.initialize();
app.start();