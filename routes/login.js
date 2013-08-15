'use strict';

var User = require('../models/user.js');

module.exports = function (req, res) {
    req.session.save();
    res.send({user: req.user.sanitize()});
};
