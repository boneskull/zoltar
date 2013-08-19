'use strict';

module.exports = function (app) {
  app.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
};
