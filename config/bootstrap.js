'use strict';

var State = require('./../models/state'),
  User = require('./../models/user'),
  stateData = require('./../public/data/states.json'),
  _ = require('underscore');

// configure states
State.find({}).exec().then(function (states) {
  if (states.length !== Object.keys(stateData).length) {
    State.remove({}).exec().then(function () {
      State.create(_.map(stateData, function (name, abbr) {
        return new State({
          abbr: abbr,
          name: name
          //TODO: dojMask
        });
      }), function (err) {
        if (err) {
          throw new Error(err);
        }
        console.log("BOOTSTRAP: Added State data to DB.");
      });
    });
  }
});

// configure admin
User.findOne({username: 'admin'}, function (err, user) {
  if (!user) {
    User.register(new User({
        username: 'admin',
        admin: true,
        email: 'chiller@badwing.com'}
    ), 'p00p00', function (err, user) {
      if (err) {
        throw new Error(err);
      }
      console.log('BOOTSTRAP: Created admin user.');
    });
  }
});


