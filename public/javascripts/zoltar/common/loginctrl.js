/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name zoltarCommon.controller:LoginCtrl
   * @requires $scope
   * @requires Restangular
   * @requires zoltar.service:User
   * @requires $timeout
   * @requires socketIO.service:socket
   */
  angular.module('zoltarCommon').controller('LoginCtrl',
      function ($scope, Restangular, User, $timeout, socket, dialog, $window) {

        /**
         * @ngdoc object
         * @name zoltarCommon.controller:LoginCtrl#credentials
         * @propertyOf zoltarCommon.controller:LoginCtrl
         * @description
         * Stores credentials
         * @property {string} username Username
         * @property {string} password Password
         */
        $scope.credentials = {};

        $scope.forgot = function () {
          alert('oh noes');
        };

        /**
         * @ngdoc method
         * @name zoltarCommon.controller:LoginCtrl#login
         * @methodOf zoltarCommon.controller:LoginCtrl
         * @description
         * Attempts a login.  Fails if the form is not valid.  Builds
         * user from {@link zoltarCommon.controller:LoginCtrl#credentials `credentials`}.
         */
        $scope.login = function () {
          var user, login;
          if (!$scope.loginForm.$valid) {
            return;
          }
          user = new User({
            username: $scope.credentials.username,
            password: $scope.credentials.password
          });
          console.log(user);
          $scope.loginProgress = 0;
          login = Restangular.all('login');
          login.post(user)
              .always(function (res) {
                $scope.loginProgress = 1;
                return res;
              })
              .then(function () {
                $scope.failedLogin = false;
                $timeout(function () {
                  $scope.loginProgress = false;
                  $window.location.href = '/';
                }, 200);
                socket.emit('user:ready');
              }, function () {
                $scope.failedLogin = true;
                $timeout(function () {
                  $scope.loginProgress = false;
                }, 200);
              });
        };


      });
})();
