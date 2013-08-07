(function () {
    'use strict';

    var admin = angular.module('zoltar.admin', []);

    admin.controller('AdminCtrl', function ($scope, socket) {
        socket.emit('admin:ready');
    });

    admin.controller('AdminAddUserCtrl', function ($scope, Restangular, User, socket) {
        $scope.mismatchedPasswords = false;
        $scope.missingRequiredFields = true;
        $scope.newUser = {};

        $scope.addUser = function () {
            var newUser, register;
            delete $scope.addedUser;
            delete $scope.registrationError;
            if ($scope.adduser.$valid) {
                $scope.missingRequiredFields = false;
                if ($scope.newUser.password1 !== $scope.newUser.password2) {
                    $scope.mismatchedPasswords = true;
                    delete $scope.newUser.password;
                } else {
                    $scope.mismatchedPasswords = false;
                    $scope.newUser.password = $scope.newUser.password1;
                    newUser = new User($scope.newUser);
                    newUser.password = newUser.password1;
                    delete newUser.password1;
                    delete newUser.password2;
                    socket.emit('admin:register', newUser);
                }
            }
            else {
                $scope.missingRequiredFields = true;
            }

        };

        socket.on('admin:registrationSuccessful', function (user) {
            delete $scope.newUser;
            $scope.addedUser = user.username;
        });

        socket.on('admin:registrationFailure', function (err) {
            console.log(err);
            $scope.registrationError = err;
        });
    });

    admin.controller('AdminUserListCtrl', function ($scope, socket, $timeout) {

        socket.on('admin:userlist', function (userlist) {
            $scope.userlist = userlist;
        });

        socket.on('admin:deleteUserSuccess', function () {
            $scope.deleteProgress = 1;
            $timeout(function () {
                $scope.deleteProgress = false;
                $scope.cancelDelete();
            }, 200);
        });

        socket.on('admin:deleteUserFailure', function (err) {
            $scope.deleteProgress = 1;
            $scope.deleteFailure = err;
        });

        $scope.confirmDelete = function (user) {
            $scope.deleteUser = user;
        };

        $scope.cancelDelete = function () {
            $scope.$emit('close:confirmDelete');
        };

        $scope.onCloseConfirmDelete = function () {
            delete $scope.deleteUser;
        };

        $scope.delete = function () {
            $scope.deleteProgress = 0;
            socket.emit('admin:deleteUser', $scope.deleteUser);
        };
    });

})();