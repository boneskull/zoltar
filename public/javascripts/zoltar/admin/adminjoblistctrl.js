/*global angular*/
(function () {
  'use strict';

  angular.module('zoltarAdmin').controller('AdminJobListCtrl',
    function AdminJobListCtrl($scope, $cacheFactory) {

      var objectCache = $cacheFactory.get('objects');
      $scope.$watch(function () {
        return objectCache.get('jobs');
      }, function (newval, oldval) {
        if (newval !== oldval) {
          $scope.joblist = newval;
        }
      }, true);
    });

})();
