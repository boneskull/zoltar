var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose'),
    sanitize = require('../plugins/sanitize');

var User = new Schema({
    username: {
        type: String,
        require: true,
        index: {
            unique: true
        }
    },
    admin: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        },
        validate: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
    },
    url: String
});


User.plugin(passportLocalMongoose, {});
User.plugin(sanitize, {accept: ['username', 'email', 'admin']});

module.exports = mongoose.model('User', User);