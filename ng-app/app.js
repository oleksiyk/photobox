// Declare app level module which depends on filters, and services
var app = angular.module('Photobox.js', ['Photobox.js.filters', 'Photobox.js.services', 'Photobox.js.directives']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/index'
            }).
            when('/login', {
                templateUrl: 'partials/login'
            })./*
            when('/message/:index/:id', {
                templateUrl: 'partials/messageView'
            }).
            when('/streams/:stream', {
                template: '<ng-include src="templateUrl"></ng-include>',
                controller: function($scope, $routeParams){$scope.templateUrl = 'partials/streams/' + $routeParams.stream;}
            }).*/
            otherwise({
                redirectTo: '/'
            });
    }]);

app.value('ui.config', {
    date: {
        //firstDay: 1
    }
});