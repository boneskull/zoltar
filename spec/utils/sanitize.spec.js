/*global beforeEach, afterEach, describe, it, expect */
"use strict";

var sanitize = require('../../utils/sanitize'),
  mongoose = require('mongoose'), schema, data = {bar: 'bar', baz: 'baz'},
  Schema = mongoose.Schema;

beforeEach(function () {
  schema = new Schema({
    bar: 'String',
    baz: 'String'
  });
});

afterEach(function () {
  delete mongoose.models.Foo;
  delete mongoose.modelSchemas.Foo;
});

describe("sanitize plugin", function () {
  it('should accept an array of allowed fields', function () {
    var Foo, foo;
    schema.plugin(sanitize, {accept: ['bar', 'baz']});
    Foo = mongoose.model('Foo', schema);
    foo = new Foo(data);
    expect(foo.sanitize()).toEqual(data);
  });

  it('should decline specific fields', function () {
    var Foo, foo;
    schema.plugin(sanitize, {decline: ['bar']});
    Foo = mongoose.model('Foo', schema);
    foo = new Foo(data);
    expect('bar' in foo.sanitize()).toBeFalsy();
  });

  it('should overwrite accept with decline', function() {
    var Foo, foo;
    schema.plugin(sanitize, {accept: ['bar', 'baz'], decline: ['bar']});
    Foo = mongoose.model('Foo', schema);
    foo = new Foo(data);
    expect('bar' in foo.sanitize()).toBeFalsy();
  });
});
