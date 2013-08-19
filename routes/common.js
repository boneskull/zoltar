'use strict';

var Q = require('q'),
  User = require('../models/user'),
  Org = require('../models/org'),
  Job = require('../models/job'),
  State = require('../models/state');

module.exports = function (app) {
  return {
    isAdmin: function isAdmin(req, res, next) {
      if (!req.user || !req.user.admin) {
        res.redirect('/');
      }
      else {
        next();
      }
    },

    emitStates: function (req) {
      State.find({}).exec().then(function (states) {
        req.io.emit('visitor:states', states);
      })
    },

    emitJobs: function (req) {
      Job.find({}).populate('org').exec().then(function (jobs) {
        req.io.emit('visitor:jobs', jobs);
      });
    },

    /**
     * @doc function
     * @name utils.io:ifAdminSocket
     * @description
     * If the request socket's session has a user in it that happens to NOT
     * be an admin, reject the promise.
     * @param {Object} req Request
     * @returns {Object} Promise
     */
    ifAdminSocket: function ifAdminSocket(req) {
      return User.findOne({
        username: req.session.passport.user
      }).exec().then(function (user) {
          if (!user.admin) {
            return Q.reject();
          }
          return user;
        });
    },

    /**
     * @doc function
     * @name utils.io:broadcastUserlist
     * @param {Object} req Request
     * @description
     * Broadcasts the userlist to all sockets in room "admin".
     */
    broadcastUserlist: function broadcastUserlist(req) {
      this.ifAdminSocket(req)
        .then(function () {
          return User.find({}).exec();
        })
        .then(function (users) {
          app.io.room('admin').broadcast('admin:userlist',
            users.map(function (user) {
              return user.sanitize();
            }));
        });
    },
    /**
     * @doc function
     * @name utils.io:broadcastOrglist
     * @param {Object} req Request
     * @description
     * Broadcasts orglist to all sockets in room "admin"
     */
    broadcastOrglist: function broadcastOrglist(req) {
      this.ifAdminSocket(req)
        .then(function () {
          return Org.find({}).populate('users state').exec();
        })
        .then(function (orgs) {
          app.io.room('admin').broadcast('admin:orglist', orgs);
        }, function (err) {
          console.log('some err ' + err);
        });
    }
  };
};
