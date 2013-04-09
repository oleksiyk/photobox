//'b.c'.split('.').reduce(function(o, i){ return o[i] }, a)

var path = require('path');
var persistentObject = require('fs-persistent-object');
var _ = require('underscore');

var DropboxState = function(dropbox, runtimeDir){
    this._updating = false;

    this.dropbox = dropbox;

    this._callbacks = [];

    this.state = persistentObject.load(path.resolve(runtimeDir, '.dropbox.state'), {
        updated: null,
        cursor: null,
        fs: {}
    });
}

DropboxState.prototype.update = function(cb){

    if(_.isFunction(cb)){
        this._callbacks.push(cb);
    }

    if(this._updating){
        return;
    }

    if(this.state.updated < (Date.now() - 5*60*1000)){

        this._updating = true;

        console.log('Updating Dropbox delta...');

        this.dropbox.delta({
            cursor: this.state.cursor
        }, function(status, reply){

            this._updating = false;

            if(status == 200){
                console.log('Delta: entries.length:', reply.entries.length, ', has_more:', reply.has_more, ', reset:', reply.reset);
                this.state.updated = Date.now();
                this._parse(reply);
                this._callCallbacks(null);
            } else {
                console.error(reply);
                this._callCallbacks(reply);
            }

        }.bind(this))
    } else {
        this._callCallbacks(null);
    }
}

DropboxState.prototype._callCallbacks = function(err){
    var cb = null;
    while(cb = this._callbacks.shift()){
        _.defer(cb, err);
    }
}

DropboxState.prototype._parse = function(delta){
    this.state.cursor = delta.cursor;

    if(delta.reset){
        this.state.fs = {};
    }

    _.each(delta.entries, function(entry){

        var obj = entry[0].split('/').reduce(function(o, i, k, d){
            //console.log(o, i);

            if(i == '') return o;

            if(!o['entries']){
                o['entries'] = {}
            }

            if(!o.entries[i]){
                o.entries[i] = {
                    metadata: {}
                }
            }

            if(!entry[1] && k == d.length-1){
                delete o.entries[i];
                return null;
            }

            return o.entries[i] }, this.state.fs);

        if(obj){
            obj.metadata = entry[1];
        }

    }.bind(this));
}

DropboxState.prototype.list = function(root, path, white_attrs){

    root = root || '';
    path = (root  + '/' + path).toLowerCase();

    white_attrs = white_attrs || ['is_dir', 'modified', 'path', 'bytes', 'icon'];

    var listing = [];

    var obj = path.split('/').reduce(function(o, i, k, d){
        if(i == '') return o;

        if(!o || !o['entries'] || !o.entries[i]){
            return null;
        }

        return o.entries[i] }, this.state.fs);

    // return only single level
    if(obj){

        _.each(obj.entries, function(value, key){
            var entry = _.pick(value.metadata, white_attrs);
            entry.path = entry.path.substring(root.length);

            listing.push(entry);
        })
    }

    return listing;
}

module.exports = function(dropbox, runtimeDir){
    return new DropboxState(dropbox, runtimeDir);
}