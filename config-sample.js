
/**
 *  main():  Main code.
 */

/* the port should be the same than in public/js/app.js */
exports.ipaddress = '[your ipaddress]';
exports.port = '[your port]';

/* In openshift, parameters should be : 
 *
 * exports.ipaddress = process.env.OPENSHIFT_INTERNAL_IP || process.env.OPENSHIFT_NODEJS_IP;
 * exports.port = process.env.OPENSHIFT_INTERNAL_PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
 *
 * in public/js/app.js, `port` should be 8000
 */
