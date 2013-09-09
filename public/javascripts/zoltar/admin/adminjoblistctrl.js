/*global angular*/
(function () {
  'use strict';

  angular.module('zoltarAdmin').controller('AdminJobListCtrl',
    function AdminJobListCtrl($scope, $cacheFactory, $modal, $controller) {

      var objectCache = $cacheFactory.get('objects');
      $scope.joblist = objectCache.get('jobs') || [];
      $controller('ListMixinCtrl', {
        $scope: $scope,
        config: {
          list: $scope.joblist
        }

      });

      $scope.$watch(function () {
        return objectCache.get('jobs');
      }, function (joblist) {
        $scope.joblist = joblist;
      }, true);

      /**
       *
       */
      $scope.openAddJobDialog = function openAddJobDialog() {
        $modal.open(
          {
            templateUrl: 'addJob',
            controller: 'AdminAddJobCtrl',
            windowClass: 'jobModal'
          });
      };
    });
})();
