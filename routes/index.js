/*
 * GET home page.
 */

var config = require('../config');

module.exports = function (req, res) {

    var data = {
        version: config.appVersion,
        name: config.appName,
        development: config.development,
        user: req.user && req.user.sanitize(true)
    };

    res.render('index', data);
};