/*global angular*/
(function () {
    'use strict';

    var reveal = angular.module('zoltar.common.directives.reveal', []);

    reveal.directive('reveal', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            template: '<div class="reveal-modal" ng-transclude></div>',
            link: function postLink(scope, element, attrs) {
                scope.$on('close:' + attrs.id, function () {
                    $(element).foundation('reveal', 'close');
                });
            }
        };
    });
//
//    reveal.directive('revealClose', function () {
//        return  function (scope, element, attrs) {
//            element.bind('click', function () {
//                scope.$emit('close:' + attrs.revealClose);
//            });
//        };
//    });
})();