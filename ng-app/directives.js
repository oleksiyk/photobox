'use strict';

/* Directives */

/* global angular, _ */


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

                    var tmp = $('<div/>').css({
                        'position': 'absolute',
                        'top': '-10000px',
                        'width': '1px',
                        'height': '1px',
                        'overflow': 'hidden'
                    }).appendTo('body');

                    $('<img/>').appendTo(tmp).load(function(){

                        tmp.remove();

                        element.css({
                            'background-image': "url('"+ this.src +"')",
                            'background-position': 'center center',
                            'background-size': 'cover'
                        })

                        $timeout(function(){
                            element.addClass('pb_fadein');
                        }, 300)

                    }).attr('src', attrs.fadebackground)
                })
            }
        };
    }])

    .directive('autofillSpy', function ($log, $timeout) {
        var log = angular.noop;
//        log = _.partial($log.log, 'Spy:');

        var frequency = 250;

        var elements = [],
            interval;

        function setSpy(element, ctrl){
            log('set', element);
            var spyObj = {element: element, ctrl: ctrl};
            elements.push(spyObj);
            updateSpy();
        }

        function clearSpy(element) {
            log('clear', element);
            _.remove(elements, {element: element});
            updateSpy();
        }

        function updateSpy(){
            log('update', elements.length, interval);
            if(!elements.length){
                interval = clearInterval(interval);
            } else
            if (undefined === interval){
                interval = setInterval(spy, frequency);
                log('Spy started');
            }
        }

        function spy(){
            log('Spy!');
            angular.forEach(elements, function(se){
                var newValue = se.element.val();
                if(newValue != se.ctrl.$viewValue) {
                    log('Autofill detected!', se.ctrl.$viewValue, '=>', newValue);
                    $timeout(function(){
                        se.ctrl.$setViewValue(newValue);
                    })
                }
            })
        }

        return {
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                setSpy(elem, ctrl);
                scope.$on('$destroy', function(){
                    clearSpy(elem);
                })
            }
        }
    })
;
