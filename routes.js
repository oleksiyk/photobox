"use strict";

module.exports = function(app){

    app.get('/', app.controllers.site.index);
    app.get('/partials/:name', app.controllers.site.partials);
    app.post('/api/login', app.controllers.api.login);

    app.all('*', app.controllers.api.requireAuthentication)

    // API
    app.post('/api/index', app.controllers.api.index);

}
