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

                // close yourself if this event is caught.
                scope.$on('close:' + attrs.id, function () {
                    $(element).foundation('reveal', 'close');
                });

                // if onClosed attribute is specified, execute
                // function upon closed event (fired by Reveal).
                if (attrs.onClosed) {
                    element.bind('closed', function () {
                        scope.$apply(attrs.onClosed);
                    });
                }
            }
        };
    });
})();