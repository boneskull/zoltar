/*global angular*/
(function () {
    'use strict';

    angular.module('zoltarCommonControllers').controller('HeaderCtrl',
        function ($scope, $location) {

            $scope.path = function () {
                return $location.path();
            };

        });
})();
