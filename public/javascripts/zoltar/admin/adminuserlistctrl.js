/*global angular*/
(function () {
  'use strict';

  /**
   *
   * @param $scope
   * @param socket
   * @param $timeout
   * @param User
   * @param $dialog
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminUserListCtrl',
    function AdminUserListCtrl($scope, socket, $timeout, User, $dialog,
      $controller) {

      /**
       *
       * @param userlist
       * @private
       */
      var _onUserlist = function _onUserList(userlist) {
        $scope.userlist = userlist.map(function (user) {
          return new User(user);
        });

        $controller('ListMixinCtrl', {
          $scope: $scope,
          config: function () {
            return {
              list: $scope.userlist
            };
          }
        });

      };

      /**
       *
       * @param user
       */
      $scope.openConfirmDeleteUserDialog =
        function openConfirmDeleteUserDialog(user) {
          $scope.tmp.deleteUser = user;
          $dialog.dialog({
            templateUrl: 'confirmDelete',
            controller: 'AdminConfirmDeleteUserCtrl',
            resolve: {
              tmp: function () {
                return $scope.tmp;
              }
            }}).open().then(function () {
              delete $scope.tmp.deleteUser;
            });

        };

      /**
       *
       * @private
       */
      $scope._onViewEditUserDialogClose = function () {
        $scope.toggles.userEditMode = false;
        delete $scope.tmp.viewUser;
        delete $scope.tmp.editUser;
      };

      /**
       *
       * @param user
       * @private
       */
      $scope._openViewUserDialog = function (user) {
        $scope.tmp.viewUser = user;
        $scope.tmp.editUser = angular.copy(user);

        $dialog.dialog({
          templateUrl: 'viewUser',
          controller: 'AdminEditUserCtrl',
          resolve: {
            tmp: function () {
              return $scope.tmp;
            },
            toggles: function () {
              return $scope.toggles;
            }
          }
        }).open()
          .then($scope._onViewEditUserDialogClose);

      };

      /**
       *
       * @param user
       */
      $scope.openViewUserDialog = function (user) {
        $scope.toggles.userEditMode = false;
        $scope._openViewUserDialog(user);
      };

      /**
       *
       * @param user
       */
      $scope.openEditUserDialog = function (user) {
        $scope.toggles.userEditMode = true;
        $scope._openViewUserDialog(user);
      };

      /**
       *
       * @param field
       */
      $scope.setOrder = function (field) {
        $scope.order = $scope.order === field ? '-' + field : field;
      };

      socket.on('admin:userlist', _onUserlist);
      socket.emit('admin:ready');

    });

})();
