'use strict';

var config = require('../config'),
    fs = require('fs');

module.exports = function (req, res) {

    var schemaFiles = [
        {
            path: '/models/user.json',
            name: 'User'
        }
    ];

    var data = {
        version: config.appVersion,
        name: config.appName,
        development: config.development,
        user: req.user && req.user.sanitize(true),
        schemaFiles: JSON.stringify(schemaFiles)
    };

    res.render('index', data);
};
