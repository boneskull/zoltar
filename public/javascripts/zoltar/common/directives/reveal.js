/*global angular*/
(function () {
    'use strict';

    angular.module('zoltar.common.directives.reveal', []).directive('reveal', function () {
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
})();