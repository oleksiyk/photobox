var _ = require('underscore');
var async = require('async');
var util = require('util');

module.exports = function(app){

    return {
        index: function(req, res){

            var getDirThumbnail = function(dir){

                var list = app.locals.dropboxState.list(app.config.folder, dir.path);

                var findImage = function(list){
                    return _.find(list, function(entry){
                        if(/\.(jpg|png)$/i.test(entry.path)){
                            return true;
                        }
                        return false;
                    })
                }

                var p = findImage(list);

                if(p){
                    return p.path;
                } else {
                    var p = false;
                    _.find(list, function(entry){
                        if(entry.is_dir){
                            _p = getDirThumbnail(entry)
                            if(_p){
                                p = _p;
                                return true;
                            }
                            return false;
                        }
                        return false;
                    })
                    if(p){
                        return p
                    }
                }
            }

            app.locals.dropboxState.update();

            var list = app.locals.dropboxState.list(app.config.folder, req.body.path);

            _.each(list, function(entry){
                if(entry.is_dir){
                    entry.thumbnailPath = getDirThumbnail(entry);
                    entry.contentDirs = 0;
                    entry.contentFiles = 0;
                    _.each(app.locals.dropboxState.list(app.config.folder, entry.path), function(e){
                        if(e.is_dir){
                            entry.contentDirs++;
                        } else if(/\.(jpg|png)$/i.test(e.path)){
                            entry.contentFiles++;
                        }
                    });
                }
            });

            res.json(list);
        },

        login: function(req, res){

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
        },

        requireAuthentication: function(req, res, next){
            if (req.session.authenticated) {
                next();
            } else {
                res.status(403).json({
                    //error: 'Unauthorized'
                });
            }
        }

    }
}

