'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    check = require('validator').check,
    generator = require('mongoose-gen'),
    fs = require('fs'),
    Org, data;

generator.setConnection(mongoose);

generator.setValidator('email', function (str) {
    return check(str).isEmail();
});

generator.setValidator('tel', function(str) {
    return /^1?\W*([2-9][0-8][0-9])\W*([2-9][0-9]{2})\W*([0-9]{4})(\se?x?t?(\d*))?$/.test(str);
});

generator.setValidator('ein', function(str) {
    return /^\d{2}-\d{7}$/.test(str);
});

generator.setDefault('email', function() {
    return 'email';
});

data = fs.readFileSync('public/schemas/org.json');
Org = new Schema(generator._convert(JSON.parse(data).schema));
module.exports = mongoose.model('Org', Org);
