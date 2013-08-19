"use strict";

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  generator = require('mongoose-gen'),
  Job, data = require('../public/schemas/job.json');

Job = new Schema(generator._convert(data.schema));
module.exports = mongoose.model('Job', Job);
