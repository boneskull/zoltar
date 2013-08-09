'use strict';

var config = require('../config'),
    fs = require('fs');

module.exports = function (req, res) {

    var schemaFiles = [
        {
            path: 'public/models/user.json',
            name: 'User'
        }
    ];
    var schemas = {};

    var i = schemaFiles.length;
    while(i--) {
        schemas[schemaFiles[i].name] = JSON.parse(fs.readFileSync(schemaFiles[i].path));
    }

    var data = {
        version: config.appVersion,
        name: config.appName,
        development: config.development,
        user: req.user && req.user.sanitize(true),
        schemas: JSON.stringify(schemas)
    };

    res.render('index', data);
};
