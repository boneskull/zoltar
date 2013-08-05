var passport = require('passport');

module.exports = function (app) {

    app.get('/', function (req, res) {
        require('./routes/index')(req, res);
    });

    app.post('/login', passport.authenticate('local'), function (req, res) {
        require('./routes/login')(req, res);
    });

    app.post('/logout', function (req, res) {
        require('./routes/logout')(req, res);
    });
};