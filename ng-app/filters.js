'use strict';

/* Filters */

angular.module('Photobox.js.filters', []).
    filter('datetime', function() {
        return function(timestamp, iso) {
            if(timestamp === undefined) return;
            if(iso){
                return new Date(timestamp).toISOString();
            }
            return new Date(timestamp).toString();
        }
    })
    ;
