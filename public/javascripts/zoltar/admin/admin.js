/*global angular*/
(function () {
  'use strict';

  var admin = angular.module('zoltarAdmin', []);

  var AdminCtrl = function AdminCtrl($scope) {

    $scope.selected = {};

    $scope.toggles = {
      userEditMode: false
    };

  };

  var AdminConfirmDeleteUserCtrl = function AdminConfirmDeleteUserCtrl($scope,
      socket, dialog, selected, $timeout) {
    $scope.selected = selected;
    $scope.cancelDeleteUser = function () {
      dialog.close();
    };

    $scope.delete = function () {
      $scope.deleteProgress = 0;
      socket.emit('admin:deleteUser', $scope.selected.deleteUser);
    };

    socket.on('admin:deleteUserSuccess', function () {
      $scope.deleteProgress = 1;
      $timeout(function () {
        $scope.deleteProgress = false;
        $scope.cancelDeleteUser();
      }, 200);
    });

    socket.on('admin:deleteUserFailure', function (err) {
      $scope.deleteProgress = 1;
      $scope.deleteFailure = err;
      $timeout(function () {
        $scope.deleteProgress = false;
      }, 200);
    });
  };

  var AdminAddUserCtrl = function AdminAddUserCtrl($scope, Restangular, User,
      socket, $timeout) {
    $scope.mismatchedPasswords = false;
    $scope.missingRequiredFields = true;

    $scope.addUser = function () {
      var newUser, register;
      delete $scope.addedUser;
      delete $scope.registrationError;
      $scope.addUserProgress = 0;
      if ($scope.addUserForm.$valid) {
        $scope.missingRequiredFields = false;
        if ($scope.selected.newUser.password1 !==
            $scope.selected.newUser.password2) {
          $scope.mismatchedPasswords = true;
          delete $scope.selected.newUser.password;
        } else {
          $scope.mismatchedPasswords = false;
          $scope.selected.newUser.password =
              $scope.selected.newUser.password1;
          newUser = new User($scope.selected.newUser);
          newUser.password = newUser.password1;
          delete newUser.password1;
          delete newUser.password2;
          socket.emit('admin:register', newUser);
        }
      }
      else {
        $scope.missingRequiredFields = true;
      }

    };

    socket.on('admin:registrationSuccessful', function (user) {

      $scope.addUserProgress = 1;
      $timeout(function () {
        $scope.addUserProgress = false;
      }, 200);

      delete $scope.selected.newUser;

      $scope.addedUser = user.username;
    });

    socket.on('admin:registrationFailure', function (err) {
      $scope.addUserProgress = 1;
      $timeout(function () {

        $scope.addUserProgress = false;
      }, 200);

      $scope.registrationError = err;
    });
  };

  var AdminUserListCtrl = function AdminUserListCtrl($scope, socket, $timeout,
      User, $dialog) {

    var PAGE_LENGTH = 10;

    $scope.$watch('currentPage', function (newval) {
      if ($scope.userlist) {
        $scope.begin = (newval - 1) * PAGE_LENGTH;
        $scope.end = $scope.begin + PAGE_LENGTH;
      }
    });

    socket.on('admin:userlist', function (userlist) {
      $scope.userlist = userlist.map(function (user) {
        return new User(user);
      });

      $scope.noOfPages =
          Math.ceil($scope.userlist.length / PAGE_LENGTH);
      $scope.currentPage = $scope.currentPage || 1;

    });

    $scope.openConfirmDeleteUserDialog = function (user) {
      $scope.selected.deleteUser = user;
      $dialog.dialog({templateUrl: 'confirmDelete', controller: 'AdminConfirmDeleteUserCtrl', resolve: {selected: function () {
        return $scope.selected
      }}})
          .open().then(function () {
            delete $scope.selected.deleteUser;
          });

    };

    $scope._onViewEditUserDialogClose = function () {
      $scope.toggles.userEditMode = false;
      delete $scope.selected.viewUser;
      delete $scope.selected.editUser;
    };

    $scope._openViewUserDialog = function (user) {
      $scope.selected.viewUser = user;
      $scope.selected.editUser = angular.copy(user);

      $dialog.dialog({templateUrl: 'viewUser', controller: 'AdminEditUserCtrl', resolve: {selected: function () {
        return $scope.selected
      }, toggles: function () {
        return $scope.toggles
      }}})
          .open().then($scope._onViewEditUserDialogClose);

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
      if ($scope.order === field) {
        $scope.order = '-' + field;
      }
      else if ($scope.order === '-' + field) {
        $scope.order = field;
      }
      else {
        $scope.order = field;
      }
    };

    socket.emit('admin:ready');

  };

  var AdminEditUserCtrl = function AdminEditUserCtrl($scope, socket, $timeout,
      dialog, selected, toggles) {

    $scope.toggles = toggles;
    $scope.selected = selected;

    socket.on('admin:saveUserSuccess', function () {
      $scope.editUserProgress = 1;
      $timeout(function () {
        $scope.editUserProgress = false;
        $scope.cancelEditUser();
      }, 200);
    });

    socket.on('admin:saveUserFailure', function (err) {
      $scope.editUserProgress = 1;
      $scope.saveUserFailure = err;
      $timeout(function () {
        $scope.editUserProgress = false;
      }, 200);

    });

    $scope.saveUser = function (user) {
      if ($scope.schemaForm.$valid) {
        if ((user.password1 || user.password2) && user.password1 !==
            user.password2) {
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

    $scope.cancelEditUser = function () {
      dialog.close();
    };

  };

  var AdminOrgListCtrl = function AdminOrgListCtrl($scope, socket, Org, $dialog) {

    socket.on('admin:orglist', function (orglist) {
      $scope.orglist = orglist.map(function (org) {
        return new Org(org);
      });
    });

    $scope.openAddOrgDialog = function openAddOrgDialog() {
      $dialog.dialog({templateUrl: 'addOrg', controller: 'AdminAddOrgCtrl', dialogClass: 'addOrgModal modal'})
          .open();

    };
  };

  var AdminAddOrgCtrl = function AdminAddOrgCtrl($scope, socket, $timeout,
      dialog, Org) {

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

    socket.on('admin:addOrgSuccess', function () {
      $scope.addOrgProgress = 1;
      $timeout(function () {
        $scope.addOrgProgress = false;
        $scope.cancelAddOrg();
      }, 200);
    });

    socket.on('admin:addOrgFailure', function (err) {
      $scope.addOrgProgress = 1;
      $scope.addOrgError = err;
      console.log(err);
      $timeout(function () {
        $scope.addOrgProgress = false;
      }, 200);
    });


  };

  admin.controller('AdminCtrl', AdminCtrl);
  admin.controller('AdminConfirmDeleteUserCtrl', AdminConfirmDeleteUserCtrl);
  admin.controller('AdminAddUserCtrl', AdminAddUserCtrl);
  admin.controller('AdminUserListCtrl', AdminUserListCtrl);
  admin.controller('AdminEditUserCtrl', AdminEditUserCtrl);
  admin.controller('AdminOrgListCtrl', AdminOrgListCtrl);
  admin.controller('AdminAddOrgCtrl', AdminAddOrgCtrl);

})();
