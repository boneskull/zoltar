var passport = require('passport'),
    User = require('./models/user'),
    Q = require('q'),
    extend = require('util')._extend;

module.exports = function (app) {

    var isAdmin = function isAdmin(req, res, next) {
        if (!req.user || !req.user.admin) {
            res.redirect('/');
        }
        else {
            next();
        }
    };

    var ifAdminSocket = function (req) {
        return User.findOne({
            username: req.session.passport.user
        }).exec().then(function (user) {
                if (!user.admin) {
                    return Q.reject();
                }
            });
    };

    var broadcastUserlist = function broadcastUserlist(req) {
        ifAdminSocket(req)
            .then(function () {
                return User.find({}).exec();
            })
            .then(function (users) {
                app.io.broadcast('admin:userlist',
                    users.map(function (user) {
                        return user.sanitize();
                    }));
            });
    };

    var register = function register(data, cb) {
        User.register({
            username: data.username,
            url: data.url,
            email: data.email
        }, data.password, cb);
    };


    app.get('/', function (req, res) {
        require('./routes/index')(req, res);
    });

    app.get('/admin', isAdmin, function (req, res) {
        require('./routes/admin')(req, res);
    });

    app.io.route('admin', {
            ready: function (req) {
                broadcastUserlist(req);
            },
            register: function (req) {
                register(req.data, function (err, user) {
                    var msg;
                    if (user && !err) {
                        broadcastUserlist(req);
                        req.io.emit('admin:registrationSuccessful', user);
                    } else {
                        switch (err.code) {
                            case 11000:
                                msg = 'Duplicate email address "' + req.data.email + '"';
                                break;
                            default:
                                msg = err.message;
                        }
                        req.io.emit('admin:registrationFailure', msg);
                    }
                });
            },
            deleteUser: function (req) {
                ifAdminSocket(req).then(function () {
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
                            broadcastUserlist(req);
                            req.io.emit('admin:deleteUserSuccess');
                        }, function (err) {
                            req.io.emit('admin:deleteUserFailure', err);

                        });
                });

            },
            saveUser: function (req) {
                if (ifAdminSocket(req)) {
                    User.findOne({username: req.data.username}).exec()
                        .then(function (user) {
                            var dfrd = Q.defer();
                            extend(user, {
                                email: req.data.email,
                                url: req.data.url,
                                admin: req.data.admin
                                // todo: add password
                            });
                            user.save(function (err) {
                                if (err) {
                                    dfrd.reject(err);
                                }
                                dfrd.resolve();
                            });
                            return dfrd.promise;
                        }, function (err) {
                            req.io.emit('admin:saveUserFailure', err);
                        })
                        .then(function () {
                            broadcastUserlist(req);
                            req.io.emit('admin:saveUserSuccess');
                        }, function (err) {
                            var msg;
                            switch (err.code) {
                                case 11001:
                                    msg = 'Duplicate email address "' + req.data.email + '"';
                                    break;
                                default:
                                    msg = err.message;
                            }
                            req.io.emit('admin:saveUserFailure', msg);
                        });
                }
            }
        }
    );

    app.post('/register', isAdmin, function (req, res) {
        var body = req.body;
        User.register({
            username: body.username,
            url: body.url,
            email: body.email
        }, body.password, function (err, user) {
            if (err) {
                res.send(500, err);
            }
            else {
                broadcastUserlist(req);
                res.send({user: user.sanitize()});
            }

        });
    });

    app.post('/login', passport.authenticate('local'),
        function (req, res) {
            require('./routes/login')(req, res);
        });

    app.post('/logout', function (req, res) {
        require('./routes/logout')(req, res);
    });
}
;