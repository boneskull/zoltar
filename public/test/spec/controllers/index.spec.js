/*global angular, describe, beforeEach, it, inject, expect, module, jasmine*/

'use strict';

angular.module('zoltarCommon').constant('zoltarSchemas', []);

describe('Controller: ZoltarCtrl', function () {

  beforeEach(module('zoltar'));

  var ZoltarCtrl, $scope, User, socket = jasmine.createSpyObj('socket',
      ['emit', 'on']), currentUser = {username: 'foo'};

  beforeEach(inject(function ($controller, $rootScope, $cacheFactory) {
    $scope = $rootScope.$new();
    User = jasmine.createSpy('User').andReturn(currentUser);
    ZoltarCtrl = $controller('ZoltarCtrl', {
      $scope: $scope,
      currentUser: currentUser,
      $cacheFactory: $cacheFactory,
      User: User,
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

