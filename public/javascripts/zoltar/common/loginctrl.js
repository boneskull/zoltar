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
    function ($scope, Restangular, User, $timeout, socket,
      $window, delay) {

      /**
       * @ngdoc object
       * @name zoltarCommon.controller:LoginCtrl#credentials
       * @propertyOf zoltarCommon.controller:LoginCtrl
       * @description
       * Stores credentials
       * @property {string} username Username
       * @property {string} password Password
       */
      this.credentials = {};

      this.forgot = function () {
        alert('oh noes');
      };

      /**
       * @ngdoc method
       * @name zoltarCommon.controller:LoginCtrl#login
       * @methodOf zoltarCommon.controller:LoginCtrl
       * @description
       * Attempts a login.  Fails if the form is not valid.  Builds
       * user from
       * {@link zoltarCommon.controller:LoginCtrl#credentials `credentials`}
       * .
       */
      $scope.login = function () {
        var user, login = Restangular.all('login');
        if (!$scope.loginForm.$valid) {
          return;
        }
        user = new User($scope.credentials);
        $scope.loginProgress = 0;
        login.post(user)
          .finally(function (res) {
            $scope.loginProgress = 1;
            return res;
          })
          .then(function () {
            $scope.failedLogin = false;
            delay($scope, 'loginProgress').then(function () {
              $window.location.href = '/';
            });
            socket.emit('user:ready');
          }, function () {
            $scope.failedLogin = true;
            delay($scope, 'loginProgress');
          });
      };

    });
})();
