/*global angular*/
(function () {
    'use strict';

    var zoltar = angular.module('zoltar', [
        'zoltar.admin',
        'zoltar.common',
        'zoltar.index',
        'foundation',
        'ladda',
        'restangular',
        'socket.io'
    ]);

    zoltar.constant('zoltarConstants', {
        partialPath: '/partials/'
    });

    zoltar.config(function ($locationProvider, $routeProvider,
        zoltarConstants) {
        var partialPath = zoltarConstants.partialPath;

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/admin', {
                templateUrl: partialPath + 'admin.html',
                controller: 'AdminCtrl'
            })
            .otherwise({
                templateUrl: 'main'
            });

    });

})();
