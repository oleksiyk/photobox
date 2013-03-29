'use strict';

/* Directives */


angular.module('Photobox.js.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }])
;