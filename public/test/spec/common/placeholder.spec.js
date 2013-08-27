'use strict';

describe('Module: placeholder', function () {

  beforeEach(function () {
    module('placeholder');
  });

  describe('Directive: placholder', function () {
    var markup = '<select placeholder="foo"></select>';

    it('should prepend the placeholder to the options',
      inject(function ($compile, $rootScope) {
        var compiled = $compile(markup)($rootScope);
        $rootScope.$apply();
        expect(compiled.length).toBe(1);
        expect(compiled.children()[0].tagName).toBe('OPTION');
        expect(compiled.children().text()).toBe('foo');
        expect(compiled.children().attr('value')).toBe('');
      }));
  });

});
