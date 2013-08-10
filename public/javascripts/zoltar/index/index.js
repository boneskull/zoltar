/*global angular*/
(function () {
    'use strict';

    var index = angular.module('zoltar.index', []);

    index.controller('ZoltarCtrl', function ($scope, currentUser, User) {

        if (currentUser) {
            $scope.user = new User(currentUser);
        }

        $scope.$on('setUser', function (evt, user) {
            $scope.user = user;
        });



    });

    index.controller('NavCtrl', function ($scope, Restangular, $location) {

        $scope.logout = function () {
            var logout = Restangular.all('logout');
            logout.post().then(function () {
                $scope.$emit('setUser', null);
                $location.path('/');
            });
        };
    });

})();
