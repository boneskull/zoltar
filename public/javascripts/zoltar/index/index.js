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
   * Master controller for main page
   */
  var ZoltarCtrl = function ZoltarCtrl($scope, currentUser, User, socket) {

    socket.emit('visitor:ready');

    if (currentUser) {
      $scope.user = new User(currentUser);
      socket.emit('user:ready');
    }

  };

  index.controller('ZoltarCtrl', ZoltarCtrl);

})();
