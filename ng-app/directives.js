'use strict';

/* Directives */


angular.module('Photobox.js.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };
    }]).
    directive('prettyphoto', function () {
        return {
            restrict: 'AC',
            link: function (scope, element, attrs) {

                attrs.$observe('href', function(href){

                    var config = $.extend({}, {
                        overlay_gallery: false,
                        deeplinking: false,
                        social_tools: false,
                        opacity: 0.9
                    })

                    element.prettyPhoto(config);
                })
            }
        };
    })
;