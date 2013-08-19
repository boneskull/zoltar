/*global angular*/
(function () {
  'use strict';

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

})();
