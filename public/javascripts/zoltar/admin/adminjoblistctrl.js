/*global angular*/
(function () {
  'use strict';

  angular.module('zoltarAdmin').controller('AdminJobListCtrl',
    function AdminJobListCtrl($scope, $cacheFactory) {

      var objectCache = $cacheFactory.get('objects');
      $scope.$watch(function () {
        return objectCache.get('jobs');
      }, function (joblist) {
        $scope.joblist = joblist;
      }, true);

      /**
       *
       */
      $scope.openAddJobDialog = function openAddOrgDialog() {
        $dialog.dialog(
          {
            templateUrl: 'addOrg',
            controller: 'AdminAddOrgCtrl',
            dialogClass: 'addOrgModal modal'
          }).open();
      };
    });
})();
