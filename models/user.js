'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    sanitize = require('../plugins/sanitize'),
    check = require('validator').check,
    generator = require('mongoose-gen'),
    fs = require('fs'),
    User, data;

generator.setConnection(mongoose);
generator.setDefault('now', function () {
    return Date.now();
});

generator.setDefault('false', function () {
    return false;
});

generator.setValidator('email', function (str) {
    return check(str).isEmail();
});

data = fs.readFileSync('public/models/user.json');

User = new Schema(generator._convert(JSON.parse(data)));

User.plugin(passportLocalMongoose, {});
User.plugin(sanitize, {accept: ['username', 'email', 'admin', 'createdon']});

module.exports = mongoose.model('User', User);
