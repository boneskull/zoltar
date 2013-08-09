'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var State = new Schema({
    _id: String,
    name: {
        type: String,
        required: true
    },
    dojMask: String
});

module.exports = mongoose.model('State', State);
