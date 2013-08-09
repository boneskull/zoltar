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
        enum: ["AK", "AL", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL",
            "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD",
            "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ",
            "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN",
            "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY"],
        required: true
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
