'use strict';

var User = require('../../models/user'),
  Org = require('../../models/org'),
  Job = require('../../models/job'),
  Q = require('q'),
  _ = require('underscore'),
  extend = require('util')._extend;

module.exports = function (app) {

  var common = require('../common')(app);

  app.io.route('admin', {
    ready: function (req) {
      common.ifAdminSocket(req).then(function () {
        req.io.join('admin');
        common.broadcastUserlist(req);
        common.broadcastOrglist(req);
      });
    },
    register: function (req) {
      common.ifAdminSocket(req).then(function () {
        User.register({
            username: req.data.username,
            url: req.data.url,
            email: req.data.email,
            org: req.data.org
          },
          req.data.password, function (err, user) {
            var msg;
            if (user && !err) {
              if (user.org) {
                Org.findById(user.org).exec().then(function (org) {
                  org.users = _.uniq(org.users.concat(user._id));
                  org.save();
                  common.broadcastOrglist(req);
                });
              }
              common.broadcastUserlist(req);
              req.io.emit('admin:registrationSuccess', user);
            } else {
              switch (err.code) {
                case 11000:
                  msg = 'Duplicate email address "' +
                    req.data.email + '"';
                  break;
                default:
                  msg = err.message;
              }
              req.io.emit('admin:registrationFailure', msg);
            }
          });
      });
    },
    deleteUser: function (req) {
      common.ifAdminSocket(req).then(function () {
        User.findByIdAndRemove(req.data._id, function (err) {
          if (err) {
            req.io.emit('admin:deleteUserFailure', err);
          } else {
            common.broadcastUserlist(req);
            req.io.emit('admin:deleteUserSuccess');
          }
        });
      });

    },
    deleteOrg: function (req) {
      common.ifAdminSocket(req).then(function () {
        Org.findByIdAndRemove(req.data._id, function (err) {
          if (err) {
            req.io.emit('admin:deleteOrgFailure', err);
          } else {
            common.broadcastOrglist(req);
            req.io.emit('admin:deleteOrgSuccess');
          }
        });
      });
    },
    saveUser: function (req) {
      common.ifAdminSocket(req).then(function () {
        User.findOne({username: req.data.username}).exec()
          .then(function (user) {
            var dfrd = Q.defer(),
              save = function save() {
                user.save(function (err) {
                  if (err) {
                    dfrd.reject(err);
                  }
                  else {
                    dfrd.resolve();
                  }
                });
              };
            extend(user, {
              email: req.data.email,
              url: req.data.url,
              admin: req.data.admin
            });
            if (req.data.password) {
              user.setPassword(req.data.password, save);
            }
            else {
              save();
            }
            return dfrd.promise;
          }, function (err) {
            req.io.emit('admin:saveUserFailure', err);
          })
          .then(function () {
            common.broadcastUserlist(req);
            req.io.emit('admin:saveUserSuccess');
          }, function (err) {
            var msg;
            switch (err.code) {
              case 11001:
                msg = 'Duplicate email address "' +
                  req.data.email + '"';
                break;
              default:
                msg = err.message;
            }
            req.io.emit('admin:saveUserFailure', msg);
          });
      });
    },
    addOrg: function (req) {
      common.ifAdminSocket(req).then(function () {
        var org = new Org({
          name: req.data.name,
          ein: req.data.ein,
          contactName: req.data.contactName,
          state: req.data.state,
          contactEmail: req.data.contactEmail,
          contactPhone: req.data.contactPhone,
          preferredContactMethod: req.data.preferredContactMethod,
          users: req.data.users
        });
        org.save(function (err) {
          if (err) {
            req.io.emit('admin:addOrgFailure', err);
          } else {
            common.broadcastOrglist(req);
            req.io.emit('admin:addOrgSuccess');
          }
        });
      });
    },
    addJob: function (req) {
      common.ifAdminSocket(req).then(function () {
        User.findOne({username: req.session.passport.user}).exec()
          .then(function (user) {
            var job = new Job({
              org: req.data.org,
              headline: req.data.headline,
              created: {
                createdby: user._id
              },
              email: {
                text: req.data['email.text'],
                replyto: req.data['email.replyto'] ? req.data['email.replyto'] :
                  req.data['email.text']
              },
              tweet: {
                text: req.data['tweet.text']
              },
              content: req.data.content
            });
            job.save(function (err) {
              if (err) {
                req.io.emit('admin:addJobFailure', err);
              } else {
                common.broadcastJoblist(req);
                req.io.emit('admin:addJobSuccess');
              }
            });
          });
      })

    },
    saveOrg: function (req) {
      common.ifAdminSocket(req).then(function () {
        Org.findById(req.data._id, function (err, org) {
          var data = req.data;
          if (err) {
            req.io.emit('admin:saveOrgFailure', err);
            return;
          }
          extend(org, {
            name: data.name,
            state: data.state,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            users: data.users,
            preferredContactMethod: data.preferredContactMethod
          });
          org.save(function (err) {
            if (err) {
              req.io.emit('admin:saveOrgFailure', err);
            } else {
              common.broadcastOrglist(req);
              req.io.emit('admin:saveOrgSuccess');
            }
          });
        });
      });
    }
  });
};
