/*global angular*/
(function () {
  'use strict';

  var ladda = angular.module('ladda', []);

  /**
   * @ngdoc directive
   * @restrict A
   * @author Dean Sofer
   * @element BUTTON
   * @name ladda.directive:ladda
   * @param {expression} ladda Expression representing Ladda progress
   * @requires ng.$window
   * @description
   * Wires up a button to a Ladda progressive button.
   *
   * Don't use this directly; use {@link ladda.directive:laddaButton laddaButton} instead.
   */
  var laddaDirective = function laddaDirective($window) {

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
  };

  /**
   * @ngdoc directive
   * @name ladda.directive:laddaButton
   * @restrict E
   * @todo Figure out how to include the template here.
   * @description
   * Renders a Ladda button with all the trimmings.
   * @example
   <doc:example module="ladda">
   <doc:source>
   <ladda-button ladda="progressVariable">
   </ladda-button>
   </doc:source>
   </doc:example>
   */
  var laddaButtonDirective = function laddaButtonDirective() {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      templateUrl: 'ladda'
    };
  };

  var delay = function delay($timeout) {
    /**
     * @ngdoc function
     * @name ladda.service:delay
     * @requires ng.$timeout
     * @description
     * Handy dandy function to set a variable to false after x ms.  This is
     * used to clear a Ladda button's state after it's been completed.
     * @param {object} obj Object, typically a $scope
     * @param {string} key Key in object
     * @param {number=} [ms=200] Milliseconds
     * @returns {Promise} Promise that will be resolved when the timeout is
     * reached. The value this promise will be resolved with is the return value
     * of the `fn` function.
     */
    return function (obj, key, ms) {
      return $timeout(function () {
        obj[key] = false;
      }, ms || 200)
    };
  };

  ladda.directive('ladda', laddaDirective);
  ladda.directive('laddaButton', laddaButtonDirective);
  ladda.factory('delay', delay);

})();
