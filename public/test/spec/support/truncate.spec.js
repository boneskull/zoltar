'use strict';

describe('Module: truncate', function () {

  beforeEach(function () {
    module('truncate');
  });

  describe('Filter: truncate', function () {

    it('should truncate the text in various ways',
      inject(function ($filter) {
        var truncate = $filter('truncate');
        expect(truncate('foo')).toBe('foo');
        expect(truncate('01234567890123')).toBe('0123456...');
        expect(truncate(123456790123)).toBe('1234567...');
        expect(truncate('zoltarzoltar', 8, '..!')).toBe('zolta..!');
      }));
  });

});
