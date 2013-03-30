var path = require('path');
var express = require('express');
var prompt  = require("prompt");

prompt.colors = false;
prompt.message = '>>';

var persistentObject = require('./lib/persistent_object');

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

var dbox   = require("dbox").app(app.config.dropbox)

var accessToken = new persistentObject(path.resolve(app.config.runtimeDir, '.dropbox.access.token'), {
    token: null
});

if(!accessToken.token){
    dbox.requesttoken(function(status, request_token){

        prompt.start()
        prompt.get(['please authorize application at the following url and press ENTER when done\n' + request_token.authorize_url], function (err, result) {
            if(err){
                throw err;
            }

            dbox.accesstoken(request_token, function(status, access_token){
                console.log(access_token)

                accessToken.token = access_token;

                startExpressApp();
            })
        });
    });

} else {
    startExpressApp();
}

//generic config
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({ secret: 'photobox-topsecret' }));
    app.use(express.bodyParser());
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

require('./routes')(app);

// register exit handlers so that process.on('exit') works
var exitFunc = function(){
    console.log('\nShutting down..');
    process.exit(0);
}

process.on('SIGINT', exitFunc);
process.on('SIGTERM', exitFunc);

function startExpressApp(){

    app.dropbox = dbox.client(accessToken.token);

    app.locals.dropboxState = require('./lib/dropbox_state')(app.dropbox, app.config.runtimeDir);

    app.locals.dropboxState.update(function(err){
        if(err){
            console.error(err);
            process.exit(-1);
        }

        app.listen(4000);

        console.log('Express app started on port 4000');
    });

}



