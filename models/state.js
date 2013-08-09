'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var State = new Schema({
    abbr: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    dojMask: String
});

module.exports = mongoose.model('State', State);
