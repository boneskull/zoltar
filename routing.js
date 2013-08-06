var passport = require('passport'),
    User = require('./models/user');

module.exports = function (app) {

    var isAdmin = function isAdmin(req, res, next) {
        if (!req.user || !req.user.admin) {
            res.redirect('/');
        }
        else {
            next();

        }
    };

    app.get('/', function (req, res) {
        require('./routes/index')(req, res);
    });

    app.get('/admin', isAdmin, function (req, res) {
        require('./routes/index')(req, res);
    });

    app.post('/register', isAdmin, function (req, res) {
        User.register(req.body.user, req.body.user.password, function (err, user) {
            if (err) {
                res.send(err);
            }
            else {
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