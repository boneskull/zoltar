'use strict';

angular.module('zoltarCommon').constant('zoltarSchemas', []);

describe('Module: zoltarIndex', function () {

  beforeEach(module('zoltarIndex'));

  describe('Controller: ZoltarCtrl', function () {

    var ZoltarCtrl, $scope, User, Job, socket = jasmine.createSpyObj('socket',
      ['emit', 'on']), currentUser = {username: 'foo'}, job = {};

    beforeEach(inject(function ($controller, $rootScope, $cacheFactory) {
      $scope = $rootScope.$new();
      User = jasmine.createSpy('User').andReturn(currentUser);
      Job = jasmine.createSpy('Job').andReturn(job);
      ZoltarCtrl = $controller('ZoltarCtrl', {
        $scope: $scope,
        currentUser: currentUser,
        $cacheFactory: $cacheFactory,
        User: User,
        Job: Job,
        socket: socket
      });
    }));

    it('should emit user:ready', function () {
      expect(socket.emit).toHaveBeenCalledWith('user:ready');
    });

    it('should emit visitor:ready', function () {
      expect(socket.emit).toHaveBeenCalledWith('visitor:ready');
    });

    it('should put user on scope if it exists', function () {
      expect(User).toHaveBeenCalledWith(currentUser);
      expect($scope.user).toBe(currentUser);
    });

  });

});
