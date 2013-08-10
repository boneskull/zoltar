/*global describe, beforeEach, it, inject, expect, module*/

'use strict';

describe('Controller: ZoltarCtrl', function () {

    angular.module('zoltar').constant('zoltarSchemas', []);

    // load the controller's module
    beforeEach(module('zoltar'));

    var ZoltarCtrl,
        scope,
        User,
        currentUser = {username: 'foo'};

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        User = jasmine.createSpy('User').andReturn(currentUser);
        ZoltarCtrl = $controller('ZoltarCtrl', {
            $scope: scope,
            currentUser: currentUser,
            User: User
        });
    }));

    it('should put user on scope if it exists', function () {
        expect(User).toHaveBeenCalledWith(currentUser);
        expect(scope.user).toBe(currentUser);
    });

    it('should respond to setUser event', function() {
        var newuser = {username: 'bar'};
        scope.$broadcast('setUser', newuser);
        expect(scope.user).toBe(newuser);
    });
});
