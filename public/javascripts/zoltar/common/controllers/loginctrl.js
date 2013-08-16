/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @name zoltarCommonControllers.controller:LoginCtrl
   * @requires $scope
   * @requires Restangular
   * @requires zoltar.service:User
   * @requires $timeout
   * @requires socketIO.service:socket
   */
  angular.module('zoltarCommonControllers').controller('LoginCtrl',
      function ($scope, Restangular, User, $timeout, socket, dialog, $window) {

        /**
         * @ngdoc object
         * @name zoltarCommonControllers.controller:LoginCtrl#credentials
         * @propertyOf zoltarCommonControllers.controller:LoginCtrl
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
         * @name zoltarCommonControllers.controller:LoginCtrl#login
         * @methodOf zoltarCommonControllers.controller:LoginCtrl
         * @description
         * Attempts a login.  Fails if the form is not valid.  Builds
         * user from {@link zoltarCommonControllers.controller:LoginCtrl#credentials `credentials`}.
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
          $scope.loginProgress = 0;
          login = Restangular.all('login');
          login.post(user)
              .always(function (res) {
                $scope.loginProgress = 1;
                return res;
              })
              .then(function (res) {
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
