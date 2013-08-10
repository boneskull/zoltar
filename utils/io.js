'use strict';

var Q = require('q'),
    User = require('../models/user'),
    Org = require('../models/org');

/**
 *
 * @param app
 * @returns {{ifAdminSocket: Function, broadcastUserlist: Function}}
 */
module.exports = function (app) {
    return {
        ifAdminSocket: function ifAdminSocket(req) {
            return User.findOne({
                username: req.session.passport.user
            }).exec().then(function (user) {
                    if (!user.admin) {
                        return Q.reject();
                    }
                });
        },
        broadcastUserlist: function broadcastUserlist(req) {
            this.ifAdminSocket(req)
                .then(function () {
                    return User.find({}).exec();
                })
                .then(function (users) {
                    app.io.broadcast('admin:userlist',
                        users.map(function (user) {
                            return user.sanitize();
                        }));
                });
        },
        broadcastOrglist: function broadcastOrglist(req) {
            this.ifAdminSocket(req)
                .then(function () {
                    return Org.find({}).exec();
                })
                .then(function (orgs) {
                    app.io.broadcast('admin:orglist', orgs);
                });
        }
    };
};
