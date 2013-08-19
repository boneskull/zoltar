'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  generator = require('mongoose-gen'),
  Org, data = require('../public/schemas/org.json');

Org = new Schema(generator._convert(data.schema));
module.exports = mongoose.model('Org', Org);
