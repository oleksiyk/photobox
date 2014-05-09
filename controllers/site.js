"use strict";

var app;

module.exports = function(_app){
    app = _app;
    return exports;
}

exports.index = function(req, res){

    //render the index page
    res.render('index', {
        title: app.config.title,
        page: 'index'
    });

}

exports.partials = function(req, res){

    var name = req.params.name;
    res.render('partials/' + name);
}

