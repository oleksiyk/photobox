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
        }
    }
}

