'use strict';

var passport = require('passport'),
    User = require('./models/user'),
    State = require('./models/state');

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

  app.get('/admin', isAdmin, require('./routes/admin'));

  app.get('/states', function (req, res) {
    State.find({}).sort('name').exec().then(function (states) {
      res.send(states);
    });

  });

  app.get('/users', isAdmin, function (req, res) {
    User.find({}).exec().then(function (users) {
      res.send(users.map(function (user) {
        return user.sanitize();
      }));
    })
  });

  app.io.route('admin', require('./routes/io/admin-io')(app));

  app.io.route('user', require('./routes/io/user-io')(app));

  app.io.route('visitor', require('./routes/io/visitor-io')(app));

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
