'use strict';

var config = require('../config'),
  glob = require('glob'),
  support = require('../support.json'),
  path = require('path');

module.exports = function (app) {
  app.get('/', function (req, res) {

    var files,
      i,
      sources = 'public/javascripts/zoltar/**/*.js',
      data;

    files = support.concat(glob.sync(sources));
    i = files.length;
    while (i--) {
      // toss 'public'
      files[i] = files[i].split(path.sep).slice(1).join(path.sep);
    }

    data = {
      version: config.appVersion,
      name: config.appName,
      development: config.development,
      user: req.user && req.user.sanitize(true),
      files: files
    };

    res.render('index', data);
  });
};
