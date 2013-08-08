(function () {
    'use strict';

    angular.module('zoltar.common.controllers').controller('LoginCtrl', function ($scope, Restangular, User, $timeout) {

        $scope.credentials = {};

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
                    $scope.$emit('close:login');
                    $scope.$emit('setUser', res.user);
                    $timeout(function () {
                        $scope.loginProgress = false;
                    }, 200);
                    $scope.credentials = {};
                }, function () {
                    $scope.failedLogin = true;
                    $timeout(function () {
                        $scope.loginProgress = false;
                    }, 200);
                    $scope.credentials = {};
                });
        };


    });
})();