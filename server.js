/**
 * Module dependencies.
 */

var express = require('express'),
    config = require('./config'),
    mongoose = require('mongoose'),
    MongoStore = require('connect-mongo')(express),
    http = require('http'),
    passport = require('passport'),
    xsrf = require('./support/xsrf'),
    protectJSON = require('./support/protectJSON'),
    LocalStrategy = require('passport-local').Strategy;
path = require('path');

var app = express();

// requires the model with Passport-Local Mongoose plugged in
var User = require('./models/user');

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

mongoose.connect(config.dbUrl);

//app.use(protectJSON);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());

app.use(express.session({
    secret: config.server.cookieSecret,
    maxAge: new Date(Date.now() + 3600000),
    store: new MongoStore(
        {db: mongoose.connection.db},
        function (err) {
            console.log(err || 'connect-mongodb setup ok');
        })
}));
// Store the session in the (secret) cookie
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(xsrf);
app.use(app.router);
app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

app.configure('development', function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
    app.use(express.errorHandler());
});


User.findOne({username: 'admin'}, function (err, user) {
    if (!user) {
        User.register(new User({username: 'admin'}), 'p00p00', function (err, user) {
            console.log(user);
        });
    }
});

require('./routing')(app);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
