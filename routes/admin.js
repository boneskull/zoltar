'use strict';

module.exports = function (app) {
  var common = require('./common')(app),
    isAdmin = common.isAdmin,
    renderMain = common.renderMain;

  app.get('/admin', isAdmin, function (req, res) {
    renderMain(req, res);
  });
};
