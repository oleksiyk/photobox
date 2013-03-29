var _ = require('underscore');
var async = require('async');
var util = require('util');

module.exports = function(app){

    return {
        index: function(req, res){

            //console.log(req.body);

            app.locals.dropboxState.update();

            res.json(app.locals.dropboxState.list(app.config.folder, req.body.path))
        }

    }
}

