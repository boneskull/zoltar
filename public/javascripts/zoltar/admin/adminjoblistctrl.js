/*global angular*/
(function () {
  'use strict';

  angular.module('zoltarAdmin').controller('AdminJobListCtrl',
    function AdminJobListCtrl($scope, $cacheFactory, $dialog, $controller) {

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
        $dialog.dialog(
          {
            templateUrl: 'addJob',
            controller: 'AdminAddJobCtrl',
            dialogClass: 'jobModal modal'
          }).open();
      };
    });
})();
