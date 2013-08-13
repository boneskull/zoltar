/*global angular*/
(function () {
    'use strict';

    var admin = angular.module('zoltarAdmin', []);

    admin.controller('AdminCtrl', function ($scope, socket) {
        socket.emit('admin:ready');
        $scope.selected = {};

        $scope.toggles = {
            userEditMode: false
        };

        $scope.cancelDeleteUser = function () {
            $scope.$emit('close:confirmDelete');
        };

    });

    admin.controller('AdminAddUserCtrl',
        function ($scope, Restangular, User, socket, $timeout) {
            $scope.mismatchedPasswords = false;
            $scope.missingRequiredFields = true;

            $scope.addUser = function () {
                var newUser, register;
                delete $scope.addedUser;
                delete $scope.registrationError;
                $scope.addUserProgress = 0;
                if ($scope.addUserForm.$valid) {
                    $scope.missingRequiredFields = false;
                    if ($scope.selected.newUser.password1 !==
                        $scope.selected.newUser.password2) {
                        $scope.mismatchedPasswords = true;
                        delete $scope.selected.newUser.password;
                    } else {
                        $scope.mismatchedPasswords = false;
                        $scope.selected.newUser.password =
                            $scope.selected.newUser.password1;
                        newUser = new User($scope.selected.newUser);
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

                $scope.addUserProgress = 1;
                $timeout(function () {
                    console.log('false prog');
                    $scope.addUserProgress = false;
                }, 200);

                delete $scope.selected.newUser;

                $scope.addedUser = user.username;
            });

            socket.on('admin:registrationFailure', function (err) {
                $scope.addUserProgress = 1;
                $timeout(function () {

                    $scope.addUserProgress = false;
                }, 200);

                $scope.registrationError = err;
            });
        });

    admin.controller('AdminUserListCtrl',
        function ($scope, socket, $timeout, User) {

            var PAGE_LENGTH = 10;

            $scope.$watch('currentPage', function (newval) {
                if ($scope.userlist) {
                    $scope.begin = (newval - 1) * PAGE_LENGTH;
                    $scope.end = $scope.begin + PAGE_LENGTH;
                }
            });

            socket.on('admin:userlist', function (userlist) {
                $scope.userlist = userlist.map(function (user) {
                    return new User(user);
                });

                $scope.noOfPages =
                    Math.ceil($scope.userlist.length / PAGE_LENGTH);
                $scope.currentPage = $scope.currentPage || 1;

            });

            socket.on('admin:deleteUserSuccess', function () {
                $scope.deleteProgress = 1;
                $timeout(function () {
                    $scope.deleteProgress = false;
                    $scope.cancelDeleteUser();
                }, 200);
            });

            socket.on('admin:deleteUserFailure', function (err) {
                $scope.deleteProgress = 1;
                $scope.deleteFailure = err;
                $timeout(function () {
                    $scope.deleteProgress = false;
                }, 200);
            });

            $scope.confirmDelete = function (user) {
                $scope.selected.deleteUser = user;
            };

            $scope.onCloseConfirmDelete = function () {
                delete $scope.selected.deleteUser;
            };

            $scope.delete = function () {
                $scope.deleteProgress = 0;
                socket.emit('admin:deleteUser', $scope.selected.deleteUser);
            };

            $scope.view = function (user) {
                $scope.toggles.userEditMode = false;
                $scope.selected.viewUser = user;
            };

            $scope.edit = function (user) {
                $scope.toggles.userEditMode = true;
                $scope.selected.viewUser = user;
                $scope.selected.editUser = angular.copy(user);
            };

            $scope.setOrder = function (field) {
                if ($scope.order === field) {
                    $scope.order = '-' + field;
                }
                else if ($scope.order === '-' + field) {
                    $scope.order = field;
                }
                else {
                    $scope.order = field;
                }
            };

        });

    admin.controller('AdminEditUserCtrl',
        function ($scope, socket, $timeout) {

            socket.on('admin:saveUserSuccess', function () {
                $scope.saveProgress = 1;
                $timeout(function () {
                    $scope.saveProgress = false;
                    $scope.cancelEdit();
                }, 200);
            });

            socket.on('admin:saveUserFailure', function (err) {
                $scope.saveProgress = 1;
                $scope.saveUserFailure = err;
                $timeout(function () {
                    $scope.saveProgress = false;
                }, 200);

            });

            $scope.save = function (user) {
                if ($scope.editUserForm.$valid) {
                    if ((user.password1 || user.password2) && user.password1 !==
                        user.password2) {
                        $scope.saveUserFailure = 'Mismatched passwords.';
                        return;
                    } else if (user.password1 === user.password2) {
                        user.password = user.password1;
                        delete user.password1;
                        delete user.password2;
                    }
                    $scope.saveProgress = 0;
                    socket.emit('admin:saveUser', user);

                } else {
                    $scope.saveUserFailure = 'Missing required fields';
                }
            };

            $scope.cancelEdit = function () {
                $scope.$emit('close:viewUser');
            };

            $scope.onCloseViewUser = function () {
                $scope.toggles.userEditMode = false;
                delete $scope.selected.viewUser;
            };
        });

    admin.controller('AdminOrgListCtrl', function ($scope, socket, Org) {

        socket.on('admin:orglist', function (orglist) {
            $scope.orglist = orglist.map(function (org) {
                return new Org(org);
            });
        });
    });

    admin.controller('AdminAddOrgCtrl', function ($scope, Org) {

        $scope.orgSchema = Org.getSchema();
        $scope.newOrg = new Org();
    });

})();
