"use strict";

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var path = require('path');
var express = require('express');
var AWS = require('aws-sdk');
var Promise = require('bluebird');

var optimist = require('optimist')
    .usage('Usage: $0 [options]')
    .default('config', path.resolve(__dirname, 'config.js'));

var argv = optimist.argv;

if(argv.help || argv.h) {
    optimist.showHelp();
    return;
}

var app = module.exports = express();

app.config = require(argv.config);

//generic config
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'photobox-topsecret' }));
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/static'));
    app.use(express.static(__dirname + '/ng-app'));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.locals.pretty = true;
});

app.configure('production', function(){
    app.use(express.logger());
});

app.controllers = require('./controllers')(app);

AWS.config.update({
    accessKeyId: app.config.sirv.s3key,
    secretAccessKey: app.config.sirv.s3secret,
    s3ForcePathStyle: true
});

app.s3 = Promise.promisifyAll(new AWS.S3({
    endpoint: new AWS.Endpoint(app.config.sirv.s3endpoint)
}))

require('./routes')(app);

// register exit handlers so that process.on('exit') works
var exitFunc = function(){
    console.log('\nShutting down..');
    process.exit(0);
}

process.on('SIGINT', exitFunc);
process.on('SIGTERM', exitFunc);

app.config.port = app.config.port || 4000;

app.listen(app.config.port);

console.log('Photobox started on port ' + app.config.port);




