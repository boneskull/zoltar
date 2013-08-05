var express = require('express');

var packageJson = require('./package.json');

var app = express();

module.exports.appName = packageJson.name;
module.exports.appVersion = packageJson.version;
module.exports.development = 'development' === app.get('env');
module.exports.dbUrl = (function () {
    var mongo;

    if (process.env.VCAP_SERVICES) {
        var env = JSON.parse(process.env.VCAP_SERVICES);
        mongo = env['mongodb-1.8'][0].credentials;
    }
    else {
        mongo = {
            "hostname": "localhost",
            "port": 27017,
            "username": "",
            "password": "",
            "name": "",
            "db": "db"
        };
    }
    var generate_mongo_url = function (obj) {
        obj.hostname = (obj.hostname || 'localhost');
        obj.port = (obj.port || 27017);
        obj.db = (obj.db || 'test');
        if (obj.username && obj.password) {
            return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
        else {
            return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
        }
    };
    return generate_mongo_url(mongo);
})();

module.exports.server = {
    cookieSecret: "i'm the firestarter"
};

