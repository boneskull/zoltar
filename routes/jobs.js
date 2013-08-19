'use strict';

var Job = require('../models/job');

module.exports = function(app) {

  app.get('/jobs', function (req, res) {
    Job.find({}).exec().then(function (jobs) {
      res.send(jobs);
    });
  });

  app.get('/jobs/:id', function (req, res) {
    Job.findById(req.params.id).exec().then(function (job) {
      res.send(job);
    });
  });
};
