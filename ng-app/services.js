'use strict';

/* Services */


angular.module('Photobox.js.services', ['ngResource']).
    factory('Index', function ($resource) {
        return $resource('/api/index', {}, {
            load: {
                method: 'POST',
                isArray: false
            }
        });
    }).
    factory('Message', function ($resource) {
        return $resource('/api/message', {}, {
            load: {
                method: 'POST',
                isArray: false
            }
        });
    }).
    factory('ConfigSearches', function ($resource) {
        return $resource('/api/searches', {});
    }).
    value('version', '0.1');