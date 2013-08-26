'use strict';

var express = require('express.io'),
  config = require('./config'),
  mongoose = require('mongoose'),
  MongoStore = require('connect-mongo')(express),
  passport = require('passport'),
  xsrf = require('./utils/xsrf'),
  protectJSON = require('./utils/protectJSON'),
  LocalStrategy = require('passport-local').Strategy,
  app,
  User,
  server,
  path = require('path');

require('./models');

app = express();

// use static authenticate method of model in LocalStrategy
User = require('./models/user');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect(process.env.DB_URI ||
  'mongodb://localhost/db');

app.use(protectJSON);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());

app.use(express.session({
  secret: config.server.cookieSecret,
  maxAge: new Date(Date.now() + 3600000),
  store: new MongoStore({
      db: mongoose.connection.db
    },
    function (err) {
      console.log(err || 'connect-mongodb setup ok');
    })
}));

app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(xsrf);
app.use(app.router);
app.use(require('less-middleware')({
  src: __dirname + '/public',
  prefix: 'stylesheets',
  compress: true,
  debug: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  mongoose.set('debug', true);
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

require('./config/bootstrap');

app.http().io();

require('./routes')(app);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

