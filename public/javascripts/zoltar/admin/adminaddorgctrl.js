/*global angular*/
(function () {
  'use strict';

  /**
   *
   * @param $scope
   * @param socket
   * @param dialog
   * @param Org
   * @param delay
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminAddOrgCtrl',
    function AdminAddOrgCtrl($scope, socket, dialog, Org, delay) {

      $scope.newOrg = new Org();

      /**
       *
       */
      $scope.cancelAddOrg = function cancelAddOrg() {
        dialog.close();
      };

      /**
       *
       * @param org
       */
      $scope.addOrg = function saveOrg(org) {
        if ($scope.schemaForm.$valid) {
          $scope.addOrgProgress = 0;
          socket.emit('admin:addOrg', org);
        }
      };

      /**
       *
       */
      var onAdminAddOrgSuccess = function onAdminAddOrgSuccess() {
        $scope.addOrgProgress = 1;
        delay($scope, 'addOrgProgress').then($scope.cancelAddOrg);
      };

      /**
       *
       * @param err
       */
      var onAdminAddOrgFailure = function onAdminAddOrgFailure(err) {
        $scope.addOrgProgress = 1;
        $scope.addOrgError = err;
        delay($scope, 'addOrgProgress');
      };

      socket.on('admin:addOrgSuccess', onAdminAddOrgSuccess);
      socket.on('admin:addOrgFailure', onAdminAddOrgFailure);
    });

})();
