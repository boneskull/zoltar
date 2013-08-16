'use strict';

var Q = require('q'),
    User = require('../models/user'),
    Org = require('../models/org'),
    State = require('../models/state');

/**
 * @doc module
 * @description
 * Provides common functionality for express.io routes.
 * @param {Object} app Application object
 * @returns {Object} Utilities
 */
module.exports = function (app) {
  return {

    emitStates: function(req) {
      State.find({}).exec().then(function(states) {
        req.io.emit('visitor:states', states);
      })
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
     * Broadcasts the userlist to all connected sockets.
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
    broadcastOrglist: function broadcastOrglist(req) {
      this.ifAdminSocket(req)
          .then(function () {
            return Org.find({}).populate('users').exec();
          })
          .then(function (orgs) {
            app.io.room('admin').broadcast('admin:orglist', orgs);
          });
    }
  };
};
