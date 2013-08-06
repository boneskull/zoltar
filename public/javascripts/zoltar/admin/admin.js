(function () {
    'use strict';

    var admin = angular.module('zoltar.admin', []);

    admin.controller('AdminCtrl', function ($scope) {


    });

    admin.controller('AdminAddUserCtrl', function ($scope, Restangular, User) {
        $scope.mismatchedPasswords = false;
        $scope.missingRequiredFields = true;
        $scope.newuser = {};

        $scope.addUser = function () {
            var newuser;
            if ($scope.adduser.$valid) {
                $scope.missingRequiredFields = false;
                if ($scope.newuser.password1 !== $scope.newuser.password2) {
                    $scope.mismatchedPasswords = true;
                    delete $scope.newuser.password;
                } else {
                    $scope.mismatchedPasswords = false;
                    $scope.newuser.password = $scope.newuser.password1;
                    newuser = new User($scope.newuser);
                    newuser.password = newuser.password1;
                    delete newuser.password1;
                    delete newuser.password2;
                    var register = Restangular.all('register');
                    register.post(newuser).then(function () {
                        delete $scope.newuser;
                        $scope.addedUser = true;
                    });
                }
            }
            else {
                $scope.missingRequiredFields = true;
            }

        };
    });

})();