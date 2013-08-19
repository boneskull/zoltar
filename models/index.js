'use strict';

/**
 * @doc module
 * @name models.init
 * @description
 * Initializes the generator; sets up common validators, defaults, etc.
 */

var check = require('validator').check,
  mongoose = require('mongoose'),
  generator = require('mongoose-gen');

generator.setConnection(mongoose);

generator.setValidator('email', function (str) {
  return !str || check(str).isEmail();
});

generator.setValidator('tel', function (str) {
  return !str ||
    /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?$/.test(str);
});

generator.setValidator('ein', function (str) {
  return !str || /^\d{2}-?\d{7}$/.test(str);
});

generator.setValidator('tweet', function (str) {
  return !str || str.length <= 140;
});

generator.setDefault('false', function () {
  return false;
});

generator.setDefault('now', function () {
  return Date.now();
});

generator.setDefault('email', function () {
  return 'email';
});
