(function () {
  'use strict';
  angular.module('zoltarCommon').controller('LoginCtrl', [
    '$scope',
    'Restangular',
    'User',
    '$timeout',
    'socket',
    'dialog',
    '$window',
    function ($scope, Restangular, User, $timeout, socket, dialog, $window) {
      $scope.credentials = {};
      $scope.forgot = function () {
        alert('oh noes');
      };
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
        login.post(user).always(function (res) {
          $scope.loginProgress = 1;
          return res;
        }).then(function () {
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
    }
  ]);
}());