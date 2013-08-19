(function () {
  'use strict';
  angular.module('zoltarCommon').controller('HeaderCtrl', [
    '$scope',
    '$location',
    '$dialog',
    'Restangular',
    'socket',
    '$window',
    function HeaderCtrl($scope, $location, $dialog, Restangular, socket, $window) {
      $scope.path = $location.path;
      $scope.openLoginDialog = function openLoginDialog() {
        $dialog.dialog({
          templateUrl: 'login',
          controller: 'LoginCtrl'
        }).open();
      };
      $scope.logout = function () {
        var logout = Restangular.all('logout');
        socket.emit('user:logout');
        logout.post().then(function () {
          $window.$location.href = '/';
        });
      };
    }
  ]);
}());