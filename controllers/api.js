"use strict";

var _   = require('lodash');
var path = require('path');
var Promise = require('bluebird');

var app;

module.exports = function(_app){
    app = _app;
    return exports;
}

var _list = _.memoize(function (_path) {
    return app.s3.listObjectsAsync({
        Bucket: app.config.sirv.s3bucket,
        Delimiter: '/',
        Prefix: path.normalize(app.config.root + '/' + _path + '/')
    })
    .finally(function () {
        setTimeout(function () {
            delete _list.cache[_path]
        }, 60*1000)
    })
}, _.identity)

var _getDirThumbnail = _.memoize(function(dir){
    return _list(dir)
    .then(function (list) {
        var p = _.find(list.Contents, function(entry){
            if(/\.(jpg|png)$/i.test(entry.Key)){
                return true;
            }
            return false;
        })

        if(p){
            return list.Prefix + p.Key
        }

        return Promise.race(list.CommonPrefixes.map(function (_dir) {
            return _getDirThumbnail(path.normalize(dir + '/' + _dir.Prefix))
        }))
    })
    .finally(function () {
        setTimeout(function () {
            delete _getDirThumbnail.cache[dir]
        }, 5*60*1000)
    })
}, _.identity)

exports.index = function(req, res){

    _list(req.body.path).then(function (list) {
        var result = [];

        return Promise.map(list.CommonPrefixes, function (dir) {
            return _getDirThumbnail(path.normalize(req.body.path + '/' + dir.Prefix)).then(function (thumbnailPath) {
                result.push({
                    thumbnailPath: '//' + app.config.sirv.s3bucket + '.sirv.com' + thumbnailPath,
                    path: path.normalize(req.body.path + '/' + dir.Prefix),
                    name: path.basename(dir.Prefix),
                    is_dir: true
                })
            })
        })
        .then(function () {
            _.each(list.Contents, function (file) {
                result.push({
                    path: '//' + app.config.sirv.s3bucket + '.sirv.com' + list.Prefix + file.Key,
                    name: path.basename(file.Key),
                })
            })

            res.json(_.sortBy(result, 'name'))
        })
    })

}

exports.login = function(req, res){

    // try to authenticate user
    var pwd = app.config.users[req.body.login];

    if(!pwd || pwd != req.body.password){
        res.status(403).json({
            error: 'Login failed'
        });

    } else {
        req.session.regenerate(function(){
            req.session.authenticated = true;
            res.json({
                message: 'Welcome!'
            })
        });
    }
}

exports.requireAuthentication = function(req, res, next){

    if (!app.config.users || _.size(app.config.users) === 0 || req.session.authenticated) {
        next();
    } else {
        res.status(403).json({
            //error: 'Unauthorized'
        });
    }
}

