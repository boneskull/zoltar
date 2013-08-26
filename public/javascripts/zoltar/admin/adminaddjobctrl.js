/*global angular*/
(function () {
  'use strict';

  /**
   *
   * @param $scope
   * @param socket
   * @param dialog
   * @param Job
   * @param delay
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminAddJobCtrl',
    function AdminAddJobCtrl($scope, socket, dialog, Job, delay) {

      $scope.newJob = new Job();

      /**
       *
       */
      $scope.cancelAddJob = function cancelAddJob() {
        dialog.close();
      };

      /**
       *
       * @param job
       */
      $scope.addJob = function saveJob(job) {
        if ($scope.schemaForm.$valid) {
          $scope.addJobProgress = 0;
          socket.emit('admin:addJob', job);
        }
      };

      /**
       *
       */
      var onAdminAddJobSuccess = function onAdminAddJobSuccess() {
        $scope.addJobProgress = 1;
        delay($scope, 'addJobProgress').then($scope.cancelAddJob);
      };

      /**
       *
       * @param err
       */
      var onAdminAddJobFailure = function onAdminAddJobFailure(err) {
        $scope.addJobProgress = 1;
        $scope.addJobError = err;
        delay($scope, 'addJobProgress');
      };

      socket.on('admin:addJobSuccess', onAdminAddJobSuccess);
      socket.on('admin:addJobFailure', onAdminAddJobFailure);
    });

})();
