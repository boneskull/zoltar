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
         * @name zoltarIndex.controller:HeaderCtrl#logout
         * @methodOf zoltarIndex.controller:HeaderCtrl
         * @description
         * Logs the current user out.  Does not require an actual user.
         */
        $scope.logout = function () {
          var logout = Restangular.all('logout');
          socket.emit('user:logout');
          logout.post().then(function () {
            $window.$location.href = '/';
          });

        };

      });
})();
