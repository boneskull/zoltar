'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Org = require('./org'),
  passportLocalMongoose = require('passport-local-mongoose'),
  sanitize = require('../utils/sanitize'),
  generator = require('mongoose-gen'),
  User, data = require('../public/schemas/user.json');

User = new Schema(generator._convert(data.schema));

User.plugin(passportLocalMongoose, {});
User.plugin(sanitize, {
  accept: [
    '_id',
    'username',
    'email',
    'admin',
    'createdon',
    'org'
  ]
});

module.exports = mongoose.model('User', User);
