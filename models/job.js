'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    check = require('validator').check;

var Job = new Schema({
    created: {
        createdby: {
            type: Schema.ObjectId,
            ref: 'User',
            required: true
        },
        createdon: {
            type: Date,
            required: true,
            default: Date.now()
        }
    },
    edited: {
        editedby: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        editedon: Date
    },
    org: {
        type: Schema.ObjectId,
        ref: 'Org',
        required: true
    },
    headline: {
        type: String,
        required: true
    },
    tweet: {
        text: {
            type: String,
            validate: function(value) {
                return check(value).len(0, 140);
            },
            trim: true
        },
        senton: Date
    },
    email: {
        text: {
            type: String,
            trim: true
        },
        replyto: {
            type: String,
            trim: true,
            validate: function(value) {
                return check(value).isEmail();
            }
        },
        senton: Date
    },
    content: {
        type: String,
        trim: true
    }

});
module.exports = mongoose.model('Job', Job);