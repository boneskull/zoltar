var passport = require('passport'),
    User = require('./models/user'),
    Q = require('q');

module.exports = function (app) {

    var isAdmin = function isAdmin(req, res, next) {
        if (!req.user || !req.user.admin) {
            res.redirect('/');
        }
        else {
            next();
        }
    };

    var isAdminSocket = function (req) {
        var dfrd = Q.defer();
        if (req.session.passport.user) {
            User.findOne({username: req.session.passport.user},
                function (err, user) {
                    if (user.admin) {
                        dfrd.resolve();
                    } else {
                        dfrd.reject();
                    }
                });
        } else {
            dfrd.reject();
        }
        return dfrd.promise;
    };

    var broadcastUserlist = function broadcastUserlist(req) {
        isAdminSocket(req).then(function () {
            User.find({}, function (err, users) {
                app.io.broadcast('admin:userlist', users.map(function (user) {
                    return user.sanitize();
                }));
            });
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
            if (isAdminSocket(req)) {
                broadcastUserlist(req);
            }
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
            if (isAdminSocket(req)) {
                User.findOne({username: req.data.username},
                    function (err, user) {
                        if (err) {
                            req.io.emit('admin:deleteUserFailure', err);
                        } else {
                            user.remove(function (err) {
                                if (err) {
                                    req.io.emit('admin:deleteUserFailure', err);
                                } else {
                                    broadcastUserlist(req);
                                    req.io.emit('admin:deleteUserSuccess');
                                }
                            });
                        }
                    });
            }
        }
    });

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
};