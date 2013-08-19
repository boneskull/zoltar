/*global angular*/
(function () {
  'use strict';

  /**
   *
   * @param $scope
   * @param socket
   * @param delay
   * @param dialog
   * @param tmp
   * @param toggles
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminEditOrgCtrl',
    function AdminEditOrgCtrl($scope, socket, delay, dialog, tmp, toggles) {

      $scope.toggles = toggles;
      $scope.tmp = tmp;

      /**
       *
       */
      var onSaveOrgSuccess = function onSaveOrgSuccess() {
        $scope.editOrgProgress = 1;
        delay($scope, 'editOrgProgress').then($scope.cancelEditOrg);
      };

      /**
       *
       * @param err
       */
      var onSaveOrgFailure = function onSaveOrgFailure(err) {
        $scope.editOrgProgress = 1;
        $scope.saveOrgFailure = err;
        delay($scope, 'editOrgProgress');
      };

      /**
       *
       * @param org
       */
      $scope.saveOrg = function saveOrg(org) {
        if ($scope.schemaForm.$valid) {
          $scope.editOrgProgress = 0;
          socket.emit('admin:saveOrg', org);
        } else {
          $scope.saveOrgFailure = 'Missing required fields';
        }
      };

      /**
       *
       */
      $scope.cancelEditOrg = function cancelEditOrg() {
        dialog.close();
      };

      socket.on('admin:saveOrgSuccess', onSaveOrgSuccess);
      socket.on('admin:saveOrgFailure', onSaveOrgFailure);

    });
})();
