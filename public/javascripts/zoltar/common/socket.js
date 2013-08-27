/*global angular*/
(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name socketIO.service:socket
   * @description
   * Provides wrapper around socket.io.
   * @todo Stop using callbacks.
   */
  angular.module('socketIO', []).service('socket',
    function ($rootScope, $window, $log) {

      this._socket = $window.io.connect();

      /**
       * @ngdoc method
       * @name socketIO.service:socket#on
       * @methodOf socketIO.service:socket
       * @param {string} eventName Event name to listen on
       * @param {function} callback CB to execute
       * @description
       * Sets a listener on an event and executes `callback`.
       */
      this.on = function on(eventName, callback) {
        var socket = this._socket;
        socket.on(eventName, function () {
          var args = arguments;
          $log.debug('socket: received ' + eventName + ':');
          $log.debug(args);
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      };

      /**
       * @ngdoc method
       * @name socketIO.service:socket#emit
       * @methodOf socketIO.service:socket
       * @param {string} eventName Event name to emit
       * @param {*} data Optional data to pass
       * @param {function=} callback Callback to execute when complete
       * @description
       * Emits an event
       */
      this.emit = function emit(eventName, data, callback) {
        var socket = this._socket;
        // strip internals
        data = angular.fromJson(angular.toJson(data));
        $log.debug('sending ' + eventName + ':');
        if (data) {
          $log.debug(data);
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
    });
})();
