/*global angular, validator*/
(function () {
  'use strict';

  if (!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g, "");
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

  /**
   * @ngdoc object
   * @name zoltar.constant:zoltarConstants
   * @description
   * Some application-wide constants.
   * @property {string} partialPath Path to partials.
   * @property {number} pageLength How many items to show during pagination
   */
  zoltar.constant('zoltarConstants', {
    partialPath: '/partials/',
    pageLength: 10
  });

  /**
   * @ngdoc function
   * @name zoltar:run
   * @requires ng.$http
   * @requires ng.$cacheFactory
   * @param {ng.$http} $http $http service
   * @param {ng.$cacheFactory} $cacheFactory $cacheFactory service
   * @description
   * Sets up GET cache for $http service since you can't get a $cacheFactory
   * in config()?
   */
  var run = function run($http, $cacheFactory) {
    $http.defaults.cache = $cacheFactory('zoltar');
  };

  zoltar.config(function ($locationProvider, $routeProvider, $provide,
                          zoltarConstants, $dialogProvider,
                          SchemaProvider) {
    var partialPath = zoltarConstants.partialPath;

    $locationProvider.html5Mode(true);

    $dialogProvider.options({dialogFade: true});

    $routeProvider
        .when('/admin', {
                templateUrl: partialPath + 'admin.html',
                controller: 'AdminCtrl'
              })
        .otherwise({
                     templateUrl: 'main'
                   });

    SchemaProvider.init();
  });

  zoltar.run(run);
})();
