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
        if (!eventName || !angular.isString(eventName)) {
          throw 'invalid eventName';
        }
        socket.on(eventName, this._makeExecCallback(socket, callback));
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

        if (!eventName || !angular.isString(eventName)) {
          throw 'invalid eventName';
        }

        // strip internals
        data = angular.fromJson(angular.toJson(data));
        $log.log('sending ' + eventName + ':');
        if (data) {
          $log.log(data);
        }
        socket.emit(eventName, data,
          this._makeExecCallback(socket, callback));
      };

      this._makeExecCallback = function (socket, callback) {
        if (!socket) {
          throw 'invalid socket object';
        }
        if (angular.isDefined(callback) && !angular.isFunction(callback)) {
          throw 'invalid callback';
        }
        return function () {
          var args = arguments;
          $log.log('sent/recvd');
          $log.log(args);
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        };
      };
    });

})();
