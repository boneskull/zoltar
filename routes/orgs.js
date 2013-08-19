'use strict';

var Org = require('../models/org');

module.exports = function (app) {
  var isAdmin = require('./common')(app).isAdmin;

  app.get('/orgs', isAdmin, function (req, res) {
    Org.find({}).sort('name').exec().then(function (orgs) {
      res.send(orgs);
    });
  });

};
