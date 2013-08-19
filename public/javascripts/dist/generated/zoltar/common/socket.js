(function () {
  'use strict';
  angular.module('socketIO', []).service('socket', [
    '$rootScope',
    '$window',
    '$log',
    function ($rootScope, $window, $log) {
      this._socket = $window.io.connect();
      this.on = function on(eventName, callback) {
        var socket = this._socket;
        socket.on(eventName, function () {
          var args = arguments;
          $log.log('socket: received ' + eventName + ':');
          $log.log(args);
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      };
      this.emit = function emit(eventName, data, callback) {
        var socket = this._socket;
        data = angular.fromJson(angular.toJson(data));
        $log.log('sending ' + eventName + ':');
        if (data) {
          $log.log(data);
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