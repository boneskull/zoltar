/*global angular, $*/
$(function () {
    "use strict";

    var $injector = angular.injector(['ng']),
        $window = $injector.get('$window'),
        $http = $injector.get('$http'),
        $q = $injector.get('$q'),
        $rootScope = $injector.get('$rootScope'),
        schemaFiles, i, schemaFile,
        schemas = {}, queue = [];

    $http.get('/schemas/schemas.json').success(function (data) {
        schemaFiles = data;
        i = schemaFiles.length;
        while (i--) {
            schemaFile = schemaFiles[i];
            queue.push($http.get(schemaFile.path).success(function (json) {
                schemas[schemaFile.name] = angular.fromJson(json);
            }));
        }
        $q.all(queue).then(function () {
            angular.module('zoltar').constant('zoltarSchemas', schemas);
            angular.bootstrap($('html'), ['zoltar']);
        });
    });

    $rootScope.$apply();


});
