'use strict';

var express = require('express');

var packageJson = require('./package.json');

var app = express();

module.exports.appName = packageJson.name;
module.exports.appVersion = packageJson.version;
module.exports.development = 'development' === app.get('env');
module.exports.dbUrl = (function () {
    var mongo, generateMongoURL;

    mongo = require('./credentials.json');

    generateMongoURL = function (obj) {
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if (obj.username && obj.password) {
            return "mongodb://" + obj.username + ":" + obj.password + "@" +
                obj.hostname + ":" + obj.port + "/" + obj.db;
        }
        else {
            return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
    };
    return generateMongoURL(mongo);
})();

module.exports.server = {
    cookieSecret: "i'm the firestarter"
};

