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
        function ($scope, Restangular, User, $timeout, socket) {

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

            console.log('loginctrl');
            console.log($scope);
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
                console.log($scope);
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
                        socket.emit('user:ready');
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
