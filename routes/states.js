'use strict';

var State = require('../models/state');

module.exports = function (app) {

  app.get('/states', function (req, res) {
    State.find({}).sort('name').exec().then(function (states) {
      res.send(states);
    });

  });

};
