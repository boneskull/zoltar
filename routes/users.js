'use strict';

var User = require('../models/user');

module.exports = function (app) {

  var isAdmin = require('./common')(app).isAdmin;

  app.get('/users', isAdmin, function (req, res) {
    User.find({}).exec().then(function (users) {
      res.send(users.map(function (user) {
        return user.sanitize();
      }));
    })
  });

};
