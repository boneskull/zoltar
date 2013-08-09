'use strict';

var passport = require('passport'),
    User = require('./models/user');

module.exports = function (app) {

    var io = require('./utils/io')(app),
        isAdmin = function isAdmin(req, res, next) {
            if (!req.user || !req.user.admin) {
                res.redirect('/');
            }
            else {
                next();
            }
        };

    app.get('/', require('./routes/index'));

    app.get('/admin', isAdmin, function (req, res) {
        require('./routes/admin')(req, res);
    });

    app.io.route('admin', require('./routes/io/admin-io')(app));

    app.post('/register', function (req, res) {
        User.register({
                username: req.body.username,
                url: req.body.url,
                email: req.body.email
            },
            req.body.password,
            function (err, user) {
                if (err) {
                    res.send(500, err);
                }
                else {
                    io.broadcastUserlist(req);
                    res.send({user: user.sanitize()});
                }
            });
    });

    app.post('/login', passport.authenticate('local'),
        require('./routes/login'));

    app.post('/logout', require('./routes/logout'));
};
