/*global angular*/
(function () {
  'use strict';

  var index = angular.module('zoltarIndex', []);

  /**
   * @ngdoc controller
   * @name zoltarIndex.controller:ZoltarCtrl
   * @requires $scope
   * @requires zoltar.object:currentUser
   * @requires socket.service:socket
   * @requires zoltar.service:User
   * @constructor
   * @description
   * Master controller for main page
   */
  index.controller('ZoltarCtrl',
    function ZoltarCtrl($scope, currentUser, User, $cacheFactory, socket, Job) {

      var objectCache = $cacheFactory('objects'),
        onJoblist = function onJoblist(jobs) {
          objectCache.put('jobs', jobs.map(function (job) {
            return new Job(job);
          }));
        };

      socket.on('visitor:jobs', onJoblist);

      if (currentUser) {
        $scope.user = new User(currentUser);
        socket.emit('user:ready');
      }

      socket.emit('visitor:ready');

    });

})();
