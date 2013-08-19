'use strict';

var passport = require('passport');

module.exports = function (app) {
  app.post('/login', passport.authenticate('local'), function (req, res) {
    res.send({user: req.user.sanitize()});
  });
};
