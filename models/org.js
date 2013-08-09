'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    check = require('validator').check;

//noinspection JSHint
var Org = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    ein: {
        type: String,
        validate: /^\d{2}-\d{7}$/,
        trim: true
    },
    contactName: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        ref: 'State'
    },
    contactEmail: {
        type: String,
        index: {
            unique: true
        },
        trim: true,
        validate: function (value) {
            return check(value).isEmail();
        }
    },
    contactPhone: {
        type: String,
        trim: true,
        validate: /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?$/
    },
    preferredContactMethod: {
        type: String,
        enum: ['contactPhone', 'contactEmail']
    }


});

module.exports = mongoose.model('Org', Org);
