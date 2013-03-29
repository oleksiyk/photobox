var fs = require('fs');
var _ = require('underscore');

var objects = [];

// save (sync) all objects
// don't forget to register SIGINT and SIGTERM handlers in main app so that process.on('exit') works
process.on('exit', function(){
    _.each(objects, function(obj){
        obj.saveSync();
    })
});

// save objects to disk (async) each minute
setInterval(function(){
    _.each(objects, function(obj){
        obj.save(function(){});
    })
}, 60*1000);

var PersistentObject = function(filename, object){
    this._pfilename = filename;

    _.extend(this, object);

    objects.push(this);

    try {
        var data = fs.readFileSync(this._pfilename, { encoding: 'utf8'});
        _.extend(this, JSON.parse(data));

    } catch (e){
        if(e.code != 'ENOENT'){
            console.error(e);
        }
    }
}

PersistentObject.prototype.save = function(cb){
    var clone = _.omit(this, '_pfilename');

    fs.writeFile(this._pfilename, JSON.stringify(clone), { encoding: 'utf8'}, cb);
}

PersistentObject.prototype.saveSync = function(){
    var clone = _.omit(this, '_pfilename');

    fs.writeFileSync(this._pfilename, JSON.stringify(clone), { encoding: 'utf8'});
}

module.exports = PersistentObject;