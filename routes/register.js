'use strict';

var User = require('../models/user');

module.exports = function(app) {

  var common = require('./common')(app);

  app.post('/register', function (req, res) {
    User.register({
        username: req.body.username,
        url: req.body.url,
        email: req.body.email
      },
      req.body.password,
      function (err, user) {
        if (err) {
          res.send(500, err);
        }
        else {
          common.broadcastUserlist(req);
          res.send({user: user.sanitize()});
        }
      });
  });

};
