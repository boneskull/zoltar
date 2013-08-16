
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    generator = require('mongoose-gen'),
    fs = require('fs'),
    State, data;

generator.setConnection(mongoose);
data = fs.readFileSync('public/schemas/state.json');

State = new Schema(generator._convert(JSON.parse(data).schema));

module.exports = mongoose.model('State', State);
