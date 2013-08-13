/*global angular*/
(function () {
    'use strict';

    angular.module('zoltarCommonControllers').controller('HeaderCtrl',
        function ($scope, $location, $dialog) {

            $scope.path = function () {
                return $location.path();
            };

            $scope.openLoginDialog = function openLoginDialog() {
                var d = $dialog.dialog({templateUrl: 'login', controller: 'LoginCtrl'});
                d.open();
            }

        });
})();
