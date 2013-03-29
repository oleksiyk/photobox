
app.controller('IndexCtrl', function($scope, $rootScope, $dialog, $location, Index) {

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

            _.each(data.entries, function(entry, key){
                if(entry.metadata.is_dir){
                    $scope.folders.push(entry.metadata);
                } else {
                    $scope.files.push(entry.metadata);
                }
            })

        }.bind(this), function(err){
            console.error(err);
        })
    }

    return new IndexCtrl;

});
