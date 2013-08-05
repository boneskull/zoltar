/*global angular*/
(function () {
    'use strict';

    var index = angular.module('zoltar.index', []);

    index.controller('ZoltarCtrl', function ($scope, currentUsername, User) {

        if (currentUsername) {
            $scope.user = new User({username: currentUsername});
        }

        $scope.$on('setUser', function (evt, user) {
            $scope.user = user;
        });
    });

    index.controller('NavCtrl', function ($scope, Restangular) {

        $scope.logout = function () {
            var logout = Restangular.all('logout');
            logout.post().then(function () {
                $scope.$emit('setUser', null);
            });
        };
    });

})();