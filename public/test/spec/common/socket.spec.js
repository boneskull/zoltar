'use strict';

describe('Module: socketIO', function () {

  beforeEach(function () {
    module('socketIO');
  });

  describe('Service: socket', function () {
    var socketSpy;
    beforeEach(inject(function ($window) {
      socketSpy = jasmine.createSpyObj('socket', ['on', 'emit']);
      $window.io = {
        connect: jasmine.createSpy('connect').andReturn(socketSpy)
      };

    }));

    it('should pass through an emit event', inject(function (socket) {
      var cb = jasmine.createSpy('cb');
      expect(socket.emit).toThrow();

      socket.emit('butts');
      expect(socketSpy.emit).toHaveBeenCalledWith('butts', undefined,
        jasmine.any(Function));

      // see that it strips out internals
      socket.emit('butts', {$foo: 'bar', foo: 'baz'});
      expect(socketSpy.emit).toHaveBeenCalledWith('butts', {foo: 'baz'},
        jasmine.any(Function));

      //todo: find some way to execute this callback without creating a
      // huge stub object. probably refactor service.
      socket.emit('butts', {}, cb);
    }));
  });

});
