(function () {
  'use strict';
  angular.module('placeholder', []).directive('placeholder', function () {
    return {
      restrict: 'A',
      compile: function compile(element, attrs) {
        if (element[0].tagName.toLowerCase() !== 'select') {
          return;
        }
        if (attrs.placeholder) {
          element.prepend('<option value="">' + attrs.placeholder + '</option>');
        }
      }
    };
  });
}());