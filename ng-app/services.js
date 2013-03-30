'use strict';

/* Services */


angular.module('Photobox.js.services', ['ngResource']).
    factory('Index', function ($resource) {
        return $resource('api/index', {}, {
            load: {
                method: 'POST',
                isArray: true
            }
        });
    }).
    value('version', '0.1');