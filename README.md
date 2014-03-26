Team Data Capture
=================

An OSX app to retrieve users' input data & use it for something with Node.JS.

## Installation

### OSX App

##### APP
1. Open Xcode project
2. Product -> Archive
3. Export as Xcode Archive
4. Show package contents of archive
5. .app file will be in `Products/Applications/`

##### ACCESSIBILITY
To get the keyboard event to work, you'll need to authorize Xcode ( if dev mode ) or the compiled app to control your computer  
1. Go to System Preferences  
2. Open Security & Privacy section  
3. Add the app or Xcode ( if dev mode ) to the Accessibility list  

### Server
```
$ cd server
$ npm install
$ grunt dev
```

Do not forget to start mongo :
```
$ mongod
```

## Configuration

The main configuration values are the web socket parameters.

### OSX App
A Preferences pane is currently in development to allow change of parameters without re-compiling the app.

### Server
set your ip address and port in server/config.js
```
exports.ipaddress = '[your ipaddress]';
exports.port = '[your port]';
```
