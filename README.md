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
Load all the packages
```
$ cd server
$ npm install
$ bower install
```

Start Mongodb
```
$ mongod
```

Start the server using grunt allow you to use liveReload for the front end dev
```
$ grunt dev
```

Start the server using Node better log on for the backend dev
```
$ node server.js
```

## Configuration

The main configuration values are the web socket parameters.

### OSX App
A Preferences pane is currently in development to allow change of parameters without re-compiling the app.

### Server
Set your ip address and port in server/config.js
```
exports.ipaddress = '[your ipaddress]';
exports.port = '[your port]';
```

## Documentation

### API

We build a little api that allow you to recieve all of the events sent by the os application.  
Example:
```
var host = window.document.location.host.replace(/:.*/, ''),
port='9000';
var ws = new Socket();
ws.connect(host, port);

ws.events.addEventListener(`onmessage`, function(e) {	
	console.log('listener: onmessage', e);
});
```

Here is the list of the events:
* `onmessage`: trigger everytime a message is sent from the server
* `welcome`: trigger when the client connect the socket. it recieve the list of app_client connected.
* `newuser`: trigger when a new app_client connect.
* `closeuser`: trigger when a app_client disconnect.
* `mousemove`: trigger when a app_client move the mouse.
* `click`: trigger when a app_client click.
* `keypress`: trigger when a app_client press a key.
* `mousewheel`: trigger when a app_client scroll.

User specific event:
* `closeuser_[id]`: trigger when the app_client with the id=[id] disconnect.
* `mousemove_[id]`: trigger when the app_client with the id=[id] move the mouse.
* `click_[id]`: trigger when the app_client with the id=[id] click.
* `keypress_[id]`: trigger when the app_client with the id=[id] press a key.
* `mousewheel_[id]`: trigger when the app_client with the id=[id] scroll.

