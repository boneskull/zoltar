/*
 * GET home page.
 */

var config = require('../config');

module.exports = function (req, res) {

    var data = {
        version: config.appVersion,
        name: config.appName,
        development: config.development,
        user: req.user
    };

    res.render('index', data);
};