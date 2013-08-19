/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc controller
   * @requires ng.$rootScope.Scope
   * @requires ng.$location
   * @requires ui.bootstrap:$dialog
   * @requires Restangular
   * @requires socketIO.service:socket
   * @requires ng.$window
   * @name zoltarCommon.controller:HeaderCtrl
   * @description
   * Provides functionality to the header bar.
   * @constructor
   */
  angular.module('zoltarCommon').controller('HeaderCtrl',
    function HeaderCtrl($scope, $location, $dialog, Restangular, socket,
      $window) {

      /**
       * @ngdoc method
       * @name zoltarCommon.controller:HeaderCtrl#path
       * @methodOf zoltarCommon.controller:HeaderCtrl
       * @description
       * Alias to {@link ng.$location $location.path()}
       * @returns {string} Current path
       */
      $scope.path = $location.path;

      /**
       * @ngdoc method
       * @name zoltarCommon.controller:HeaderCtrl#openLoginDialog
       * @methodOf zoltarCommon.controller:HeaderCtrl
       * @description
       * Opens the login dialog.
       */
      $scope.openLoginDialog = function openLoginDialog() {
        $dialog.dialog({templateUrl: 'login', controller: 'LoginCtrl'}).open();
      };

      /**
       * @ngdoc method
       * @name zoltarCommon.controller:HeaderCtrl#logout
       * @methodOf zoltarCommon.controller:HeaderCtrl
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
