"use strict";

module.exports = function(app){
    return {
        site: require('./site')(app),
        api: require('./api')(app)
    }
};
