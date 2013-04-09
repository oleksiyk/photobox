var fs = require('fs');
var path = require('path');
var async = require('async');

function mkdirRecursive(dirPath, cb){
    var arr = dirPath.split('/').slice(1);
    var p = '';

    async.whilst(
        function() { return arr.length > 0},
        function(callback){
            p = p + '/' + arr.shift();

            fs.exists(p, function(exists){
                if(exists){
                    callback(null);
                } else {
                    fs.mkdir(p, function(err){
                        if(err && err.code != 'EEXIST'){
                            callback(err);
                            return;
                        }
                        callback(null);
                    });
                }
            })
        },
        cb
    )
}

module.exports = function(app){

    return {
        index: function(req, res){

            //render the index page
            res.render('index', {
                title: app.config.title,
                page: 'index'
            });

        },

        partials: function(req, res){

            var name = req.params.name;
            res.render('partials/' + name);
        },

        image: function(req, res){
            //console.log(req.query);

            var dropboxPath = app.config.folder + req.query._p;
            var size = req.params['size'] || 'm';
            var cachePath = path.resolve(app.config.runtimeDir, 'cache', size, '.'+dropboxPath);
            var curMetadata = app.locals.dropboxState.metadata(app.config.folder, req.query._p);

            var sendfile = function(fpath){
                if(size == 'o'){
                    res.attachment(fpath);
                }
                res.sendfile(fpath);
            }

            var download = function(dpath, cb){
                dpath = dpath.toLowerCase();
                if(size != 'o'){
                    app.dropbox.thumbnails(dpath, {size: size}, cb);
                } else {
                    app.dropbox.get(dpath, cb);
                }
            }

            //console.log(app.locals.dropboxState.metadata(app.config.folder, req.query._p));

            fs.stat(cachePath, function(err, stats){

                if(!err && stats.mtime.getTime() == curMetadata.modified){
                    sendfile(cachePath);
                } else {
                    download(dropboxPath, function(status, buf, metadata){
                        //console.log(status, metadata);
                        if(status == 200){

                            mkdirRecursive(path.dirname(cachePath), function(err){
                                if(err){
                                    console.error(err);
                                    return;
                                }

                                fs.writeFile(cachePath, buf, function(err){
                                    if(err){
                                        console.error(err);
                                        return;
                                    }

                                    fs.utimes(cachePath, Date.now(), Date.parse(metadata.modified)/1000);

                                    sendfile(cachePath);
                                })
                            })

                        } else {
                            res.status(status).send();
                        }
                    })
                }
            })
        }
    }
}

