var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var SQLiteStore = require('connect-sqlite3')(session);
var sessionSQLite = new SQLiteStore({table:'sessions',db:'session',dir:'./data/'});


var routes = require('./routes/index');
var users = require('./users/index');
var quotes = require('./quotes/index');
var notes = require('./notes/index');
var authenticate = require('./users/authenticate');
var portfolios = require('./portfolios/index');
var app = express();
quotes.init();
notes.init();
users.init();
authenticate.init();
portfolios.init();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function(req, res, next) {
    req.models={};
    next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: 'keyboard cat',
    name: 'need to change',
    store: sessionSQLite,
    proxy: true,
    resave: true,
    cookie:{maxAge: 7 * 24 * 60 * 60 * 1000}, // 1 week
    saveUninitialized: false 
}));
users.bind(app);
authenticate.bind(app);
notes.bind(app);
routes(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
