(function () {
  'use strict';
  angular.module('socketIO', []).service('socket', [
    '$rootScope',
    '$window',
    function ($rootScope, $window) {
      this._socket = $window.io.connect();
      this.on = function on(eventName, callback) {
        var socket = this._socket;
        socket.on(eventName, function () {
          var args = arguments;
          console.log('socket: received ' + eventName + ':');
          console.log(args);
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      };
      this.emit = function emit(eventName, data, callback) {
        var socket = this._socket;
        data = angular.fromJson(angular.toJson(data));
        console.log('sending ' + eventName + ':');
        if (data) {
          console.log(data);
        }
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        });
      };
    }
  ]);
}());