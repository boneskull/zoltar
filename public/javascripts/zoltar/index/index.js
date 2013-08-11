/*global angular*/
(function () {
    'use strict';

    var index = angular.module('zoltarIndex', []);

    /**
     * @ngdoc controller
     * @name zoltarIndex.controller:ZoltarCtrl
     * @requires $scope
     * @requires zoltar.object:currentUser
     * @requires zoltar.service:User
     * @constructor
     * @description
     * Master controller
     */
    var ZoltarCtrl = function ZoltarCtrl($scope, currentUser, User, socket) {

        socket.emit('visitor:ready');

        if (currentUser) {
            $scope.user = new User(currentUser);
            socket.emit('user:ready');
        }

        $scope.$on('setUser', function (evt, user) {
            $scope.user = user;
        });

    };

    /**
     * @ngdoc controller
     * @name zoltarIndex.controller:NavCtrl
     * @requires $scope
     * @requires Restangular
     * @requires $location
     * @constructor
     * @description
     * Controls navigation bar(s).
     */
    var NavCtrl = function NavCtrl($scope, Restangular, $location, socket) {

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
    };

    index.controller('NavCtrl', NavCtrl);
    index.controller('ZoltarCtrl', ZoltarCtrl);

})();
