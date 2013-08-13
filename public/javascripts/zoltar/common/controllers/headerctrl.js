/*global angular*/
(function () {
    'use strict';

    angular.module('zoltarCommonControllers').controller('HeaderCtrl',
        function ($scope, $location, $dialog, Restangular, socket) {

            $scope.path = function () {
                return $location.path();
            };

            $scope.openLoginDialog = function openLoginDialog() {
                $dialog.dialog({templateUrl: 'login', controller: 'LoginCtrl'})
                    .open();
            };


            /**
             * @ngdoc method
             * @name zoltarIndex.controller:NavCtrl#logout
             * @methodOf zoltarIndex.controller:NavCtrl
             * @description
             * Logs the current user out.  Does not require an actual user.
             */
            $scope.logout = function () {
                var logout = Restangular.all('logout');
                logout.post().then(function () {
                    $scope.$emit('setUser', null);
                    $location.path('/');
                });
                socket.emit('user:logout');
            };

        });
})();
