'use strict';

var User = require('../models/user');

module.exports = function (req, res) {
    require('./index')(req, res);
};
