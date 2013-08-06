/*global angular*/
(function () {
    'use strict';

    angular.module('zoltar.common.controllers').controller('HeaderCtrl',
        function ($scope, $location) {

            $scope.path = function () {
                return $location.path();
            };

        });
})();