/*global angular*/
(function () {
  'use strict';

  var admin = angular.module('zoltarAdmin', []);

  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminCtrl
   * @description
   * Parent controller for the admin console.  Provides toggles and a place
   * to put various temporary variables.
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminCtrl',
    function AdminCtrl($scope) {

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminCtrl#tmp
       * @propertyOf zoltarAdmin.controller:AdminCtrl
       * @type {{}}
       * @description
       * Temporary variables go here.  User to view, edit, delete, add, etc.
       */
      $scope.tmp = {};

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminCtrl#toggles
       * @propertyOf zoltarAdmin.controller:AdminCtrl
       * @description
       * Various view-wide toggles go in here.
       * @type {{userEditMode: boolean}}
       */
      $scope.toggles = {
        userEditMode: false
      };

    });

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

  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminAddUserCtrl
   * @requires Restangular
   * @requires ng.$rootScope.Scope
   * @requires zoltar:service.User
   * @requires ng.$timeout
   * @requires socket.service:socket
   * @requires ladda.service:delay
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminAddUserCtrl',
    function AdminAddUserCtrl($scope, Restangular, User, socket, $timeout,
      delay) {

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminAddUserCtrl#tmp.newUser
       * @propertyOf zoltarAdmin.controller:AdminAddUserCtrl
       * @description
       * Temp variable for new user.
       * @type {zoltar.service:User}
       */
      $scope.tmp.newUser = new User();

      /**
       * @ngdoc property
       * @name zoltarAdmin.controller:AdminAddUserCtrl#mismatchedPasswords
       * @propertyOf zoltarAdmin.controller:AdminAddUserCtrl
       * @description
       * Whether or not the passwords in the form are mismatched.
       * @type {boolean}
       */
      $scope.mismatchedPasswords = false;

      /**
       * @ngdoc method
       * @name zoltarAdmin.controller:AdminAddUserCtrl#addUser
       * @methodOf zoltarAdmin.controller:AdminAddUserCtrl
       * @description
       * Attemps to add {@link zoltarAdmin.controller:AdminAddUserCtrl#tmp.newUser `tmp.newUser`}
       * to db.  Checks for mismatched passwords.  Emits `admin:register` socket
       * event if valid.
       */
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

      /**
       * @description
       * Handler for `admin:registrationSuccess` event.
       * @param {zoltar.service:User} user User instance from server
       */
      var onAdminRegistrationSuccess = function onAdminRegistrationSuccess(user) {

        $scope.addUserProgress = 1;
        delay($scope, 'addUserProgress');
        $scope.tmp.newUser = new User();
        $scope.addedUser = user.username;
      };

      /**
       * @description
       * Handler for `admin:registrationFailure` event.
       * @param {string} err Error message
       */
      var onAdminRegistrationFailure = function onAdminRegistrationFailure(err) {
        $scope.addUserProgress = 1;
        delay($scope, 'addUserProgress');
        $scope.registrationError = err;
      };

      socket.on('admin:registrationSuccess', onAdminRegistrationSuccess);
      socket.on('admin:registrationFailure', onAdminRegistrationFailure);

    });

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
      zoltarConstants) {

      var PAGE_LENGTH = zoltarConstants.pageLength;

      $scope.$watch('currentPage', function (newval) {
        if ($scope.userlist) {
          $scope.begin = (newval - 1) * PAGE_LENGTH;
          $scope.end = $scope.begin + PAGE_LENGTH;
        }
      });

      /**
       *
       * @param userlist
       * @private
       */
      var _onUserlist = function _onUserList(userlist) {
        $scope.userlist = userlist.map(function (user) {
          return new User(user);
        });

        $scope.noOfPages = Math.ceil($scope.userlist.length / PAGE_LENGTH);
        $scope.currentPage = $scope.currentPage || 1;

      };

      /**
       *
       * @param user
       */
      $scope.openConfirmDeleteUserDialog =
        function openConfirmDeleteUserDialog(user) {
          $scope.tmp.deleteUser = user;
          $dialog.dialog({templateUrl: 'confirmDelete', controller: 'AdminConfirmDeleteUserCtrl', resolve: {tmp: function () {
            return $scope.tmp
          }}}).open().then(function () {
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

        $dialog.dialog({templateUrl: 'viewUser', controller: 'AdminEditUserCtrl', resolve: {tmp: function () {
          return $scope.tmp
        }, toggles: function () {
          return $scope.toggles
        }}}).open().then($scope._onViewEditUserDialogClose);

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

  /**
   * @ngdoc controller
   * @name zoltarAdmin.controller:AdminOrgListCtrl
   * @requires ng.$rootScope:Scope
   * @requires socket.service:socket
   * @requires zoltar.service:Org
   * @requires ui.bootstrap.service:$dialog
   * @requires zoltar.object:zoltarConstants
   * @description
   * Handles the Org list.
   * @constructor
   */
  angular.module('zoltarAdmin').controller('AdminOrgListCtrl',
    function AdminOrgListCtrl($scope, socket, Org, $dialog, zoltarConstants,
      $cacheFactory) {

      var PAGE_LENGTH = zoltarConstants.pageLength, objectCache = $cacheFactory.get('objects');

      var onAdminOrglist = function onAdminOrglist(orglist) {
        objectCache.put('orgs', orglist.map(function (org) {
          return new Org(org);
        }));
        $scope.orglist = objectCache.get('orgs');

        $scope.noOfPages = Math.ceil($scope.orglist.length / PAGE_LENGTH);
        $scope.currentPage = $scope.currentPage || 1;
      };

      /**
       *
       */
      $scope.openAddOrgDialog = function openAddOrgDialog() {
        $dialog.dialog({templateUrl: 'addOrg', controller: 'AdminAddOrgCtrl', dialogClass: 'addOrgModal modal'}).open();

      };

      socket.on('admin:orglist', onAdminOrglist);
    });

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

  angular.module('zoltarAdmin').controller('AdminJobListCtrl',
    function AdminJobListCtrl($scope, $cacheFactory) {

      var objectCache = $cacheFactory.get('objects');
      $scope.$watch(function () {
        return objectCache.get('jobs');
      }, function (newval, oldval) {
        if (newval !== oldval) {
          $scope.joblist = newval;
        }
      }, true);
    });

})();
