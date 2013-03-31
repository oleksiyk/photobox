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
    }).
    directive('fadebackground', ['$timeout', function ($timeout) {
        return {
            restrict: 'AC',
            link: function (scope, element, attrs) {
                element.css({
                    'opacity': 0
                });

                attrs.$observe('fadebackground', function(href){

                    var i = new Image;
                    $(i).load(function(){

                        element.css({
                            'background-image': "url('"+ i.src +"')",
                            'background-position': 'center center',
                            'background-size': 'cover'
                        })

                        $timeout(function(){
                            element.addClass('pb_fadein');
                        }, 30)

                    })
                    i.src = 'image/l?_p=' + attrs.fadebackground;
                })
            }
        };
    }])
;