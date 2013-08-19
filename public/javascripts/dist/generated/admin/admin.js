(function () {
  'use strict';
  var admin = angular.module('zoltarAdmin', []);
  angular.module('zoltarAdmin').controller('AdminCtrl', [
    '$scope',
    function AdminCtrl($scope) {
      $scope.tmp = {};
      $scope.toggles = { userEditMode: false };
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminDeleteUserCtrl', [
    '$scope',
    'socket',
    'dialog',
    'tmp',
    'delay',
    function AdminDeleteUserCtrl($scope, socket, dialog, tmp, delay) {
      $scope.tmp = tmp;
      $scope.cancelDeleteUser = function cancelDeleteUser() {
        dialog.close();
      };
      $scope.deleteUser = function deleteUser() {
        $scope.deleteProgress = 0;
        socket.emit('admin:deleteUser', $scope.tmp.deleteUser);
      };
      var onAdminDeleteUserSuccess = function onAdminDeleteUserSuccess() {
        $scope.deleteProgress = 1;
        delay($scope, 'deleteProgress').then($scope.cancelDeleteUser);
      };
      var onAdminDeleteUserFailure = function onAdminDeleteUserFailure(err) {
        $scope.deleteProgress = 1;
        $scope.deleteFailure = err;
        delay($scope, 'deleteProgress');
      };
      socket.on('admin:deleteUserSuccess', onAdminDeleteUserSuccess);
      socket.on('admin:deleteUserFailure', onAdminDeleteUserFailure);
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminAddUserCtrl', [
    '$scope',
    'Restangular',
    'User',
    'socket',
    '$timeout',
    'delay',
    function AdminAddUserCtrl($scope, Restangular, User, socket, $timeout, delay) {
      $scope.tmp.newUser = new User();
      $scope.mismatchedPasswords = false;
      $scope.addUser = function addUser() {
        var newUser, register;
        delete $scope.addedUser;
        delete $scope.registrationError;
        $scope.addUserProgress = 0;
        if ($scope.schemaForm.$valid) {
          if ($scope.tmp.newUser.password1 !== $scope.tmp.newUser.password2) {
            $scope.mismatchedPasswords = true;
            delete $scope.tmp.newUser.password;
          } else {
            $scope.mismatchedPasswords = false;
            $scope.tmp.newUser.password = $scope.tmp.newUser.password1;
            newUser = $scope.tmp.newUser;
            newUser.password = newUser.password1;
            delete newUser.password1;
            delete newUser.password2;
            socket.emit('admin:register', newUser);
          }
        } else {
          $scope.schemaForm.$setPristine();
          $timeout(function () {
            $scope.schemaForm.$setDirty();
          }, 400);
          $scope.addUserProgress = 0;
          delay($scope, 'addUserProgress');
        }
      };
      var onAdminRegistrationSuccess = function onAdminRegistrationSuccess(user) {
        $scope.addUserProgress = 1;
        delay($scope, 'addUserProgress');
        $scope.tmp.newUser = new User();
        $scope.addedUser = user.username;
      };
      var onAdminRegistrationFailure = function onAdminRegistrationFailure(err) {
        $scope.addUserProgress = 1;
        delay($scope, 'addUserProgress');
        $scope.registrationError = err;
      };
      socket.on('admin:registrationSuccess', onAdminRegistrationSuccess);
      socket.on('admin:registrationFailure', onAdminRegistrationFailure);
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminUserListCtrl', [
    '$scope',
    'socket',
    '$timeout',
    'User',
    '$dialog',
    'zoltarConstants',
    function AdminUserListCtrl($scope, socket, $timeout, User, $dialog, zoltarConstants) {
      var PAGE_LENGTH = zoltarConstants.pageLength;
      $scope.$watch('currentPage', function (newval) {
        if ($scope.userlist) {
          $scope.begin = (newval - 1) * PAGE_LENGTH;
          $scope.end = $scope.begin + PAGE_LENGTH;
        }
      });
      var _onUserlist = function _onUserList(userlist) {
        $scope.userlist = userlist.map(function (user) {
          return new User(user);
        });
        $scope.noOfPages = Math.ceil($scope.userlist.length / PAGE_LENGTH);
        $scope.currentPage = $scope.currentPage || 1;
      };
      $scope.openConfirmDeleteUserDialog = function openConfirmDeleteUserDialog(user) {
        $scope.tmp.deleteUser = user;
        $dialog.dialog({
          templateUrl: 'confirmDelete',
          controller: 'AdminConfirmDeleteUserCtrl',
          resolve: {
            tmp: function () {
              return $scope.tmp;
            }
          }
        }).open().then(function () {
          delete $scope.tmp.deleteUser;
        });
      };
      $scope._onViewEditUserDialogClose = function () {
        $scope.toggles.userEditMode = false;
        delete $scope.tmp.viewUser;
        delete $scope.tmp.editUser;
      };
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
        }).open().then($scope._onViewEditUserDialogClose);
      };
      $scope.openViewUserDialog = function (user) {
        $scope.toggles.userEditMode = false;
        $scope._openViewUserDialog(user);
      };
      $scope.openEditUserDialog = function (user) {
        $scope.toggles.userEditMode = true;
        $scope._openViewUserDialog(user);
      };
      $scope.setOrder = function (field) {
        $scope.order = $scope.order === field ? '-' + field : field;
      };
      socket.on('admin:userlist', _onUserlist);
      socket.emit('admin:ready');
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminEditUserCtrl', [
    '$scope',
    'socket',
    'delay',
    'dialog',
    'tmp',
    'toggles',
    function AdminEditUserCtrl($scope, socket, delay, dialog, tmp, toggles) {
      $scope.toggles = toggles;
      $scope.tmp = tmp;
      var onSaveUserSuccess = function onSaveUserSuccess() {
        $scope.editUserProgress = 1;
        delay($scope, 'editUserProgress').then($scope.cancelEditUser);
      };
      var onSaveUserFailure = function onSaveUserFailure(err) {
        $scope.editUserProgress = 1;
        $scope.saveUserFailure = err;
        delay($scope, 'editUserProgress');
      };
      $scope.saveUser = function saveUser(user) {
        if ($scope.schemaForm.$valid) {
          if ((user.password1 || user.password2) && user.password1 !== user.password2) {
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
      $scope.cancelEditUser = function cancelEditUser() {
        dialog.close();
      };
      socket.on('admin:saveUserSuccess', onSaveUserSuccess);
      socket.on('admin:saveUserFailure', onSaveUserFailure);
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminOrgListCtrl', [
    '$scope',
    'socket',
    'Org',
    '$dialog',
    'zoltarConstants',
    '$cacheFactory',
    function AdminOrgListCtrl($scope, socket, Org, $dialog, zoltarConstants, $cacheFactory) {
      var PAGE_LENGTH = zoltarConstants.pageLength, objectCache = $cacheFactory.get('objects');
      var onAdminOrglist = function onAdminOrglist(orglist) {
        objectCache.put('orgs', orglist.map(function (org) {
          return new Org(org);
        }));
        $scope.orglist = objectCache.get('orgs');
        $scope.noOfPages = Math.ceil($scope.orglist.length / PAGE_LENGTH);
        $scope.currentPage = $scope.currentPage || 1;
      };
      $scope.openAddOrgDialog = function openAddOrgDialog() {
        $dialog.dialog({
          templateUrl: 'addOrg',
          controller: 'AdminAddOrgCtrl',
          dialogClass: 'addOrgModal modal'
        }).open();
      };
      socket.on('admin:orglist', onAdminOrglist);
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminAddOrgCtrl', [
    '$scope',
    'socket',
    'dialog',
    'Org',
    'delay',
    function AdminAddOrgCtrl($scope, socket, dialog, Org, delay) {
      $scope.newOrg = new Org();
      $scope.cancelAddOrg = function cancelAddOrg() {
        dialog.close();
      };
      $scope.addOrg = function saveOrg(org) {
        if ($scope.schemaForm.$valid) {
          $scope.addOrgProgress = 0;
          socket.emit('admin:addOrg', org);
        }
      };
      var onAdminAddOrgSuccess = function onAdminAddOrgSuccess() {
        $scope.addOrgProgress = 1;
        delay($scope, 'addOrgProgress').then($scope.cancelAddOrg);
      };
      var onAdminAddOrgFailure = function onAdminAddOrgFailure(err) {
        $scope.addOrgProgress = 1;
        $scope.addOrgError = err;
        delay($scope, 'addOrgProgress');
      };
      socket.on('admin:addOrgSuccess', onAdminAddOrgSuccess);
      socket.on('admin:addOrgFailure', onAdminAddOrgFailure);
    }
  ]);
  angular.module('zoltarAdmin').controller('AdminJobListCtrl', [
    '$scope',
    '$cacheFactory',
    function AdminJobListCtrl($scope, $cacheFactory) {
      var objectCache = $cacheFactory.get('objects');
      $scope.$watch(function () {
        return objectCache.get('jobs');
      }, function (newval, oldval) {
        if (newval !== oldval) {
          $scope.joblist = newval;
        }
      }, true);
    }
  ]);
}());