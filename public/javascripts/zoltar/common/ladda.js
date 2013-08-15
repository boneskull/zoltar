/*global angular*/
(function () {
  'use strict';

  var ladda = angular.module('ladda', []);

  ladda.directive('ladda', function ($window) {

    return function link(scope, element, attrs) {

      var ladda = $window.Ladda.create(element[0]);

      scope.$watch(attrs.ladda, function (newVal, oldVal) {
        if (angular.isNumber(oldVal)) {
          if (angular.isNumber(newVal)) {
            ladda.setProgress(newVal);
          } else {
            if (newVal) {
              ladda.setProgress(0);
            } else {
              ladda.stop();
            }

          }
        } else {
          if (angular.isDefined(newVal)) {
            ladda.start();
          } else {
            ladda.stop();
          }
        }
      });
    };
  });

  ladda.directive('laddaButton', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'ladda'
    };
  });
})();
