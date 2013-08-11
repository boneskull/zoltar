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
        function ($rootScope, $window) {

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
                this._socket.on(eventName, function () {
                    var args = arguments;
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
                this._socket.emit(eventName, data, function () {
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
