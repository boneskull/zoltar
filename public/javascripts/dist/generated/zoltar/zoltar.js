(function () {
  'use strict';
  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, '');
    };
  }
  var zoltar = angular.module('zoltar', [
      'zoltarAdmin',
      'zoltarCommon',
      'zoltarIndex',
      'ladda',
      'ui.bootstrap',
      'restangular',
      'socketIO',
      'schemaForm',
      'placeholder'
    ]);
  zoltar.constant('zoltarConstants', {
    partialPath: '/partials/',
    pageLength: 10
  });
  zoltar.config([
    '$locationProvider',
    '$routeProvider',
    '$provide',
    'zoltarConstants',
    '$dialogProvider',
    'SchemaProvider',
    function ($locationProvider, $routeProvider, $provide, zoltarConstants, $dialogProvider, SchemaProvider) {
      var partialPath = zoltarConstants.partialPath;
      $locationProvider.html5Mode(true);
      $dialogProvider.options({ dialogFade: true });
      $routeProvider.when('/admin', {
        templateUrl: partialPath + 'admin.html',
        controller: 'AdminCtrl'
      }).otherwise({ templateUrl: 'main' });
      SchemaProvider.init();
    }
  ]);
}());