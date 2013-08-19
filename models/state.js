
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    generator = require('mongoose-gen'),
    State, data = require('../public/schemas/state.json');

State = new Schema(generator._convert(data.schema));
module.exports = mongoose.model('State', State);
