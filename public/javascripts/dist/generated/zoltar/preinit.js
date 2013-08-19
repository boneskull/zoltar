(function () {
  'use strict';
  var $injector = angular.injector(['ng']), $window = $injector.get('$window'), $http = $injector.get('$http'), $q = $injector.get('$q'), $rootScope = $injector.get('$rootScope'), $document = $injector.get('$document'), schemaFiles, i, schemaFile, schemas = {}, queue = [];
  $http.get('/schemas/schemas.json').success(function (data) {
    schemaFiles = data;
    i = schemaFiles.length;
    while (i--) {
      schemaFile = schemaFiles[i];
      queue.push(function (name) {
        return $http.get(schemaFile.path).then(function (res) {
          var json = res.data;
          return {
            name: name,
            data: angular.fromJson(json)
          };
        });
      }(schemaFile.name));
    }
    $q.all(queue).then(function (schemas) {
      var zoltarSchemas = {}, i = schemas.length;
      while (i--) {
        zoltarSchemas[schemas[i].name] = schemas[i].data;
      }
      angular.module('zoltarCommon').constant('zoltarSchemas', zoltarSchemas);
      angular.bootstrap($document[0].documentElement, ['zoltar']);
    });
  });
  $rootScope.$apply();
}());