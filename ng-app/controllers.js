
app.controller('IndexCtrl', function($scope, $location, Index, $timeout) {

    var IndexCtrl = function(){

        var path = $location.search()['_p'] || '/';

        // bind some methods to scope
        [
            'list'
        ].forEach(function(f){
            $scope[f] = angular.bind(this, this[f]);
        }.bind(this))

        $scope.breadcrumb = [];
        $scope.breadcrumb = path.split('/').slice(1).reduce(function(o, i, k, d){
            if(i == '') return o;
            o.push({
                name: i,
                path: '/' + d.slice(0, k+1).join('/')
            })

            return o;

        }, $scope.breadcrumb);

        this.list(path);
    }

    IndexCtrl.prototype.list = function(path){

        Index.load({path: path}, function(data){

            $scope.folders = [];
            $scope.files = [];

            _.each(data, function(entry){
                if(entry.is_dir){
                    if(entry.thumbnailPath){
                        entry.dirTitle = [];
                        if(entry.contentDirs){
                            entry.dirTitle.push(entry.contentDirs + ' folders')
                        }
                        if(entry.contentFiles){
                            entry.dirTitle.push(entry.contentFiles + ' images')
                        }
                        entry.dirTitle = entry.dirTitle.join(' and ');
                    }
                    $scope.folders.push(entry);
                } else if(/\.(jpg|png)$/i.test(entry.path)){
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
                $location.replace();
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
                $location.replace();
                $location.path('/');
            }).
            error(function(data, status){
                $scope.error = true;
                //console.log(data, status);
            });
    }

    return new LoginCtrl;

});
