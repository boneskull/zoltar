'use strict';

var User = require('../models/user.js');

module.exports = function (req, res) {

    res.send({user: req.user.sanitize()});
};
