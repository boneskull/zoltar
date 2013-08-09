'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    sanitize = require('../plugins/sanitize'),
    check = require('validator').check;

var User = new Schema({
    username: {
        type: String,
        require: true,
        index: {
            unique: true
        },
        trim: true
    },
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        },
        trim: true,
        validate: function (value) {
            return check(value).isEmail();
        }
    },
    createdon: {
        type: Date,
        default: Date.now(),
        required: true
    },
    url: String
});


User.plugin(passportLocalMongoose, {});
User.plugin(sanitize, {accept: ['username', 'email', 'admin', 'created']});

module.exports = mongoose.model('User', User);
