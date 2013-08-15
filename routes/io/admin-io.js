'use strict';

var User = require('../../models/user'),
  Org = require('../../models/org'),
  Q = require('q'),
  extend = require('util')._extend;

module.exports = function (app) {

  var io = require('../../utils/io')(app);

  return {
    ready: function (req) {
      io.ifAdminSocket(req).then(function (user) {
        console.log(user);
        req.io.join('admin');
        io.broadcastUserlist(req);
        io.broadcastOrglist(req);
      });
    },
    register: function (req) {
      io.ifAdminSocket(req).then(function () {
        User.register({
            username: req.data.username,
            url: req.data.url,
            email: req.data.email
          },
          req.data.password, function (err, user) {
            var msg;
            if (user && !err) {
              io.broadcastUserlist(req);
              req.io.emit('admin:registrationSuccessful', user);
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
      io.ifAdminSocket(req).then(function () {
        User.findOne({username: req.data.username}).exec()
          .then(function (user) {
            var dfrd = Q.defer();
            user.remove(function (err) {
              if (err) {
                dfrd.reject(err);
                return;
              }
              dfrd.resolve();
            });
            return dfrd.promise;
          }, function (err) {
            req.io.emit('admin:deleteUserFailure', err);
          })
          .then(function () {
            io.broadcastUserlist(req);
            req.io.emit('admin:deleteUserSuccess');
          }, function (err) {
            req.io.emit('admin:deleteUserFailure', err);

          });
      });

    },
    saveUser: function (req) {
      io.ifAdminSocket(req).then(function () {
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
            io.broadcastUserlist(req);
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
      io.ifAdminSocket(req).then(function () {
        var org = new Org({
          name: req.data.name,
          ein: req.data.ein,
          contactName: req.data.contactName,
          state: req.data.state,
          contactEmail: req.data.contactEmail,
          contactPhone: req.data.contactPhone,
          preferredContactMethod: req.data.preferredContactMethod
        }), dfrd = Q.defer();
        org.save(function (err) {
          if (err) {
            req.io.emit('admin:addOrgFailure', err);
          } else {
            io.broadcastOrglist(req);
            req.io.emit('admin:addOrgSuccess');
          }
        });


      });
    }
  };
};
