/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name placeholder.directive:placeholder
   * @todo FIX the example so the demo works. How? I don't know.
   * @description
   * Provides an empty placeholder for a SELECT tag.  Should work with
   * ngOptions & ngRepeat, but have only tested with ngOptions.
   <doc:example module="placeholder">
   <doc:source>
   <script>
   angular.module('placeholder', []).directive('placeholder', function () {
    return {
      restrict: 'A',
      compile: function compile(element, attrs) {
        if (attrs.placeholder) {
          element.prepend('<option value="">' + attrs.placeholder +
            '</option>');

        }
      }
    }
  });
   </script>
   <select ng-options="foo.baz for foo in [{baz:'trix'}, {baz:'kix'}]" ng-model="cereal"
   placeholder="Choose wisely...">
   </doc:source>
   </doc:example>
   *
   */
  angular.module('placeholder', []).directive('placeholder', function () {
    return {
      restrict: 'A',
      compile: function compile(element, attrs) {
        if (element[0].tagName.toLowerCase() !== 'select') {
          return;
        }
        if (attrs.placeholder) {
          element.prepend('<option value="">' + attrs.placeholder +
            '</option>');
        }
      }
    }
  });
})();
