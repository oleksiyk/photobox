
app.controller('IndexCtrl', function($scope, $location, Index, $timeout) {

    var IndexCtrl = function(){

        var path = $location.search()['_p'] || '/';

        // bind some methods to scope
        [
            'list'
        ].forEach(function(f){
            $scope[f] = angular.bind(this, this[f]);
        }.bind(this))

        this.list(path);
    }

    IndexCtrl.prototype.list = function(path){

        Index.load({path: path}, function(data){

            $scope.folders = [];
            $scope.files = [];

            _.each(data, function(entry){
                entry.name = entry.path.split('/');
                entry.name = entry.name[entry.name.length-1];

                if(entry.is_dir){
                    if(entry.thumbnailPath){
                        entry.thumbnailStyle = {
                            'background-image': "url('image/l?_p=" + entry.thumbnailPath + "')"
                        }
                    }
                    $scope.folders.push(entry);
                } else {
                    entry.thumbnailStyle = {
                        'background-image': "url('image/l?_p=" + entry.path + "')"
                    }
                    $scope.files.push(entry);
                }

            }.bind(this))

            $timeout(function(){
                $('a[rel*=prettyPhoto]').prettyPhoto({
                    overlay_gallery: false,
                    deeplinking: false,
                    social_tools: false,
                    opacity: 0.9
                });
            }, 100)

        }.bind(this), function(err){
            if(err.status == 403){
                $location.path('/login');
            }
        })
    }

    return new IndexCtrl;

});

app.controller('LoginCtrl', function($scope, $location, $http) {

    var LoginCtrl = function(){

        var path = $location.search()['_p'] || '/';

        // bind some methods to scope
        [
            'login'
        ].forEach(function(f){
                $scope[f] = angular.bind(this, this[f]);
            }.bind(this))

        $scope.error = false;
    }

    LoginCtrl.prototype.login = function(){
        //console.log($scope.form);

        $http.post('api/login', $scope.form).
            success(function(data, status){
                //console.log(data, status);
                $scope.error = false;
                $location.path('/');
            }).
            error(function(data, status){
                $scope.error = true;
                //console.log(data, status);
            });
    }

    return new LoginCtrl;

});
