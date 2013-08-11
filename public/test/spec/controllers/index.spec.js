/*global describe, beforeEach, it, inject, expect, module*/

'use strict';

angular.module('zoltar').constant('zoltarSchemas', []);

describe('Controller: ZoltarCtrl', function () {

    beforeEach(module('zoltar'));

    var ZoltarCtrl,
        $scope,
        User,
        socket = jasmine.createSpyObj('socket', ['emit']),
        currentUser = {username: 'foo'};

    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        User = jasmine.createSpy('User').andReturn(currentUser);
        ZoltarCtrl = $controller('ZoltarCtrl', {
            $scope: $scope,
            currentUser: currentUser,
            User: User,
            socket: socket
        });
    }));

    it('should emit visitor:ready', function() {
        expect(socket.emit).toHaveBeenCalledWith('visitor:ready');
    });

    it('should put user on scope if it exists', function () {
        expect(User).toHaveBeenCalledWith(currentUser);
        expect($scope.user).toBe(currentUser);
    });

    it('should respond to setUser event', function () {
        var newuser = {username: 'bar'};
        $scope.$broadcast('setUser', newuser);
        expect($scope.user).toBe(newuser);
    });

});

describe('Controller: NavCtrl', function () {
    beforeEach(module('zoltar'));

    var NavCtrl,
        $scope,
        $location = jasmine.createSpyObj('$location', ['path']),
        socket = jasmine.createSpyObj('socket', ['emit']),
        $hbe;

    beforeEach(inject(function ($controller, $rootScope, Restangular, $httpBackend) {
        $hbe = $httpBackend;
        $scope = $rootScope.$new();
        NavCtrl = $controller('NavCtrl', {
            $scope: $scope,
            Restangular: Restangular,
            $location: $location,
            socket: socket
        })
    }));

    it('logout() should log user out', function () {
        $hbe.expectPOST('/logout', {}).respond(200);
        $scope.logout();
        $scope.$apply();
        $hbe.flush();
        expect($location.path).toHaveBeenCalledWith('/');
        expect(socket.emit).toHaveBeenCalledWith('user:logout');
    });



});
