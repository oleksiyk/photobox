module.exports = function(app){

    // templates
    app.get('/', app.controllers.site.index);
    app.get('/partials/:name', app.controllers.site.partials);

    // API
    app.post('/api/index', app.controllers.api.index);

}