'use strict';

describe('Module: socketIO', function () {

  beforeEach(function () {
    module('socketIO');
  });

  describe('Service: socket', function () {
    var socketSpy;

    beforeEach(inject(function ($window) {
      socketSpy = jasmine.createSpyObj('socket', ['emit', 'on']);
      $window.io = {
        connect: jasmine.createSpy('connect')
          .andReturn(socketSpy)
      };
    }));

    it('should pass through an emit event', inject(function (socket) {
      expect(socket.emit).toThrow();

      socket.emit('butts');
      expect(socketSpy.emit).toHaveBeenCalledWith('butts', undefined,
        jasmine.any(Function));

      // see that it strips out internals
      socket.emit('butts', {$foo: 'bar', foo: 'baz'});
      expect(socketSpy.emit).toHaveBeenCalledWith('butts', {foo: 'baz'},
        jasmine.any(Function));

    }));

    it('should pass through an on handler', inject(function (socket) {
      expect(socket.on).toThrow();

      socket.on('foo');
      expect(socketSpy.on).toHaveBeenCalledWith('foo',
        jasmine.any(Function));

    }));

    it('should create a callback execution function', inject(function (socket) {
      var cb = jasmine.createSpy('cb');
      expect(socket._makeExecCallback).toThrow();
      expect(function () {
        socket._makeExecCallback(socketSpy, 'foo');
      }).toThrow();
      socket._makeExecCallback(socketSpy, cb)('foo');
      expect(cb).toHaveBeenCalledWith('foo');
    }));
  });

});
