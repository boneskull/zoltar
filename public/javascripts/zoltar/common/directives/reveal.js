/*global angular, $*/
(function () {
    'use strict';

    var directives = angular.module('zoltarCommonDirectives');

    /**
     * @ngdoc directive
     * @name zoltarCommonDirectives.directive.reveal
     * @element ELEMENT
     * @param {string=} onClosed Expression to apply when modal is closed
     * @description
     * Generates markup
     * for a Foundation Reveal modal.  Attaches a close
     * event to the scope, and optionally accepts an onClosed expression
     * attribute that will execute when the modal is completely closed.
     */
    directives.directive('reveal', function () {
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
