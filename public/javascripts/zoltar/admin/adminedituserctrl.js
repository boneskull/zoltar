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
  angular.module('zoltarAdmin').controller('AdminEditUserCtrl',
    function AdminEditUserCtrl($scope, socket, delay, dialog, tmp, toggles) {

      $scope.toggles = toggles;
      $scope.tmp = tmp;

      /**
       *
       */
      var onSaveUserSuccess = function onSaveUserSuccess() {
        $scope.editUserProgress = 1;
        delay($scope, 'editUserProgress').then($scope.cancelEditUser);
      };

      /**
       *
       * @param err
       */
      var onSaveUserFailure = function onSaveUserFailure(err) {
        $scope.editUserProgress = 1;
        $scope.saveUserFailure = err;
        delay($scope, 'editUserProgress');
      };

      /**
       *
       * @param user
       */
      $scope.saveUser = function saveUser(user) {
        if ($scope.schemaForm.$valid) {
          if ((user.password1 || user.password2) &&
            user.password1 !== user.password2) {
            $scope.saveUserFailure = 'Mismatched passwords.';
            return;
          } else if (user.password1 === user.password2) {
            user.password = user.password1;
            delete user.password1;
            delete user.password2;
          }
          $scope.editUserProgress = 0;
          socket.emit('admin:saveUser', user);

        } else {
          $scope.saveUserFailure = 'Missing required fields';
        }
      };

      /**
       *
       */
      $scope.cancelEditUser = function cancelEditUser() {
        dialog.close();
      };

      socket.on('admin:saveUserSuccess', onSaveUserSuccess);
      socket.on('admin:saveUserFailure', onSaveUserFailure);

    });
})();
