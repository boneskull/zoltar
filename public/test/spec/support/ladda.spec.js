'use strict';

describe('Module: ladda', function () {

  beforeEach(function () {
    module('ladda');
  });

  describe('Directive: ladda', function () {
    var markup = '<button ladda="foo"></button>',
      scope, ladda = jasmine.createSpyObj('ladda',
        ['stop', 'setProgress', 'start']);

    beforeEach(inject(function ($rootScope, $window) {
      scope = $rootScope.$new();
      $window.Ladda = {
        create: jasmine.createSpy('create')
          .andReturn(ladda)
      };
    }));

    it('should interact with Ladda as the value changes',
      inject(function ($compile) {
        $compile(markup)(scope);
        scope.$apply();
        expect(ladda.stop).toHaveBeenCalled();
        scope.$apply('foo = 0.1');
        expect(ladda.start).toHaveBeenCalled();
        scope.$apply('foo = 0.2');
        expect(ladda.setProgress).toHaveBeenCalledWith(0.2);
        scope.$apply('foo = false');
        expect(ladda.stop).toHaveBeenCalled();
      }));
  });

  describe('Directive: laddaButton', function () {
    var tpl = '<div ng-transclude></div>',
      markup = '<ladda-button>foo</ladda-button>',
      scope;

    beforeEach(inject(function ($rootScope, laddaOptions) {
      scope = $rootScope.$new();
      laddaOptions.templatePath = 'ladda';
    }));

    it('should replace and transclude',
      inject(function ($compile, $templateCache) {
        $templateCache.put('ladda', tpl);
        var compiled = $compile(markup)(scope);
        scope.$apply();
        expect(compiled.length).toBe(1);
        expect(compiled.text()).toBe('foo');
      }));
  });

  describe('Factory: delay', function () {

    it('should fail on bad parameters', inject(function (delay) {
      expect(function () {
        delay();
      }).toThrow();
      expect(function () {
        delay('foo');
      }).toThrow();
      expect(function () {
        delay('foo', 'bar');
      }).toThrow();
      expect(function () {
        delay({}, {});
      }).toThrow();
    }));

    it('should return a promise', inject(function (delay) {
      var obj = {},
        result = delay(obj, 'foo');
      expect(angular.isFunction(result.then)).toBeTruthy();
    }));

    it('should set the key false after n ms',
      inject(function (delay, $timeout) {
        var obj = {};
        delay(obj, 'foo', 200);
        $timeout.flush();
        expect(obj.foo).toBeDefined();
        expect(obj.foo).toBeFalsy();
      }));

  });

});
