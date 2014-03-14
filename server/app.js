var express = require('express'),
    http = require('http'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    routes = require('./routes'),
    users = require('./routes/user'),
    app = express(),
    Socket = require('./sockets').Socket;


/**
 *  Define the team capture application.
 */
var TeamCaptureApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 9000;
        self.mongodb_host = process.env.OPENSHIFT_MONGODB_DB_HOST;
        self.mongodb_port = process.env.OPENSHIFT_MONGODB_DB_PORT;
        self.mongodb_username = process.env.OPENSHIFT_MONGODB_DB_USERNAME;
        self.mongodb_password = process.env.OPENSHIFT_MONGODB_DB_PASSWORD;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            self.ipaddress = "127.0.0.1";
        }

        if (typeof self.mongodb_host === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            self.mongodb = "mongodb://localhost/teamcapture";
            self.mongodb_db = "teamcapture";
        }else{
            self.mongodb = "mongodb://[user]:[password]@"+self.mongodb_host+":"+self.mongodb_port+"/public";
            self.mongodb_db = "public";
        }
    };

    self.getHost = function(){
      return 'http://'+self.ipaddress+':'+self.port;
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Initialize mongoose
     */
    self.initializeMongo = function() {

      mongoose.connect(self.mongodb);
       
      var db = exports.db = mongoose.connection;
      db.on('error', console.error.bind(console, 'connection error:'));
      db.once('open', function callback () {
        console.log('Connected to teamcapture DB');
      });

    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
      
      self.app = exports.app = express();
      self.server = exports.server = http.createServer(self.app);

      self.app.configure(function(){
          self.app.set('views', __dirname + '/views/');
          self.app.set('view engine', 'jade');
          self.app.set('strict routing', true);
          self.app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
          self.app.use(express.bodyParser());
          self.app.use(express.methodOverride());
          self.app.use(self.app.router);
          self.app.use(express.static(path.join(__dirname, 'public')));
      });
    };

    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
      self.setupVariables();
      self.setupTerminationHandlers();

      self.initializeMongo();
      // Create the express server and routes.
      self.initializeServer();
    };

    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {

      routes(self.app);
      
      //  Start the app on the specific interface (and port).
      self.server.listen(self.port, self.ipaddress, function() {
        console.log('%s: Node server started on %s:%d ...',
                    Date(Date.now() ), self.ipaddress, self.port);
      });
      

      /*
       * Socket.io
       */


      self.socket = new Socket();
      self.socket.initialize(self.server);
    };
};

exports.TeamCaptureApp = TeamCaptureApp;