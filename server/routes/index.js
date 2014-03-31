'use strict';

var Socket = require('../providers/socket').Socket;

/* GET home page. */
exports = module.exports = function(app) {
	app.get('/', function(req, res){
		res.render('index', { title: 'Teamdata Capture' });
	});
	app.get('/socket/:mac/', function(req, res){
	  Socket.findOne({'mac':req.params.mac}).exec(function(err, socket){
	    if(err) {
	      res.send({type:'error'});
	    }else{
	      res.send({type:'socket', data:socket});
	    }
	  });
	});
};