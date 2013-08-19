'use strict';

module.exports = function (app) {
  var isAdmin = require('./common')(app).isAdmin;

  app.get('/admin', isAdmin, function (req, res) {
    require('./main')(req, res);
  });
};
