/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminDeleteUserCtrl
   * @requires socket.service:socket
   * @requires ladda.service:delay
   * @param {ng.$rootScope.Scope} $scope Scope
   * @param {Object} socket Socket service
   * @param {Object} dialog Dialog object from ui-bootstrap
   * @param {ladda.service:delay} delay Delay service
   * @param {Object} tmp {@link zoltarAdmin.controller:AdminCtrl#tmp object}
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminDeleteUserCtrl',
    function AdminDeleteUserCtrl($scope, socket, dialog, tmp, delay) {

      $scope.tmp = tmp;

      /**
       * @ngdoc method
       * @name zoltarAdmin.controller:AdminDeleteUserCtrl#cancelDeleteUser
       * @methodOf zoltarAdmin.controller:AdminDeleteUserCtrl
       * @description
       * Closes the "confirmDelete" dialog.
       */
      $scope.cancelDeleteUser = function cancelDeleteUser() {
        dialog.close();
      };

      /**
       * @ngdoc method
       * @name zoltarAdmin.controller:AdminDeleteUserCtrl#deleteUser
       * @methodOf zoltarAdmin.controller:AdminDeleteUserCtrl
       * @description
       * Emits an `admin:deleteUser` event to the socket.
       */
      $scope.deleteUser = function deleteUser() {
        $scope.deleteProgress = 0;
        socket.emit('admin:deleteUser', $scope.tmp.deleteUser);
      };

      /**
       * @description
       * Handler for `admin:deleteUserSuccess` socket event.
       */
      var onAdminDeleteUserSuccess = function onAdminDeleteUserSuccess() {
        $scope.deleteProgress = 1;
        delay($scope, 'deleteProgress').then($scope.cancelDeleteUser);
      };

      /**
       * @description
       * Handler for `admin:deleteUserFailure` socket event.
       * @param {string} err Error message
       */
      var onAdminDeleteUserFailure = function onAdminDeleteUserFailure(err) {
        $scope.deleteProgress = 1;
        $scope.deleteFailure = err;
        delay($scope, 'deleteProgress');
      };

      socket.on('admin:deleteUserSuccess', onAdminDeleteUserSuccess);
      socket.on('admin:deleteUserFailure', onAdminDeleteUserFailure);

    });

})();
