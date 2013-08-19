(function () {
  'use strict';
  var index = angular.module('zoltarIndex', []);
  index.controller('ZoltarCtrl', [
    '$scope',
    'currentUser',
    'User',
    '$cacheFactory',
    'socket',
    function ZoltarCtrl($scope, currentUser, User, $cacheFactory, socket) {
      var objectCache = $cacheFactory('objects');
      if (currentUser) {
        $scope.user = new User(currentUser);
        socket.emit('user:ready');
      }
      var onJoblist = function onJoblist(jobs) {
        objectCache.put('jobs', jobs.map(function (job) {
          return new Job(job);
        }));
      };
      socket.on('visitor:jobs', onJoblist);
      socket.emit('visitor:ready');
    }
  ]);
}());