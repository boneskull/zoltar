'use strict';

var express = require('express');

var packageJson = require('../package.json');

var app = express();

module.exports.appName = packageJson.name;
module.exports.appVersion = packageJson.version;
module.exports.development = 'development' === app.get('env');

module.exports.server = {
    cookieSecret: process.env.COOKIE_SECRET || "i'm the firestarter"
};

