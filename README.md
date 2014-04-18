Team Data Capture

An OSX app to retrieve users' input data & use it for something with Node.JS.
So far the app is tracking :
- scroll
- left click
- mouse move

The app also has a messenger system, to send chat-type messages.

## Update the project on Openshift

### Openshift project
1. Login to the website https://openshift.redhat.com
2. Create a new app
3. Go in your app settings
4. Add your ssh key to Public Keys
5. Get the openshift git repo url : `<openshift-git-repo-url>`
6. Clone your github project in local and checkout in the good branch
7. Create a remote of the openshift repo : `$ git remote add openshift -f <openshift-git-repo-url>`
8. Commit your files from your local project and fixed conflicts (when you create a new app in openshift, some files are created so you can have conflicts)
9. Push your files to the openshift git repo : `$ git push openshift openshift:master`
If you use npm, when you push your files, openshift will install all your node modules listed in `package.json`.

Some issues can appear when grunt node modules are listed in `package.json`. To prevent those issue: 
1. Build your project with grunt packages listed in `package.json`
2. Install your package with `$ npm install`
3. Build your project with `$ grunt command`
4. Before commiting and pushing your changes, remove all grunt dependencies from `package.json`

## Configuration

The main configuration values are the web socket parameters.

### OSX App
A Preferences window is available to change Host & Port settings. Open it from the menu bar item.
To run the app on the Openshift server, set the following values :
Host : yourdomain.rhcloud.com ()
Port : 8000

### Server
In config.js update `db_name` parameter by the database name created by openshift : 
```
exports.db_name = `<db_name_openshift>`;
exports.ipaddress = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP;
exports.port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
```

## Documentation

### API

We build a little api that allow you to recieve all of the events sent by the os application.  
Example:
```
var host = window.document.location.host.replace(/:.*/, ''),
port='8000';
var ws = new Socket();
ws.connect(host, port);

ws.events.addEventListener(`onmessage`, function(e) {
	console.log('listener: onmessage', e);
});
```

Here is the list of the events:
* `onmessage`: triggered every time a message is sent from the server
* `welcome`: triggered when the client connect the socket. it recieve the list of app_client connected.
* `newuser`: triggered when an new app_client connect.
* `closeuser`: triggered when an app_client disconnect.
* `mousemove`: triggered when an app_client move the mouse.
* `click`: triggered when an app_client click.
* `messenger`: triggered when an app_client sends a message
* `scroll`: triggered when an app_client scroll.

User specific event:
* `closeuser_[id]`: triggered when the app_client with the id=[id] disconnect.
* `mousemove_[id]`: triggered when the app_client with the id=[id] move the mouse.
* `click_[id]`: triggered when the app_client with the id=[id] click.
* `messenger_[id]`: triggered when the app_client with the id=[id] sends a message.
* `scroll_[id]`: triggered when the app_client with the id=[id] scroll.
