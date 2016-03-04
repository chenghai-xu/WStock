var controllers = require('../users/controlers/index');
var quotes = require('../quotes/quotes');
var passport = require('passport');
module.exports = function (app) {
  app.get('/', index);
  app.get('/quotes', quotes.live);
  app.get('/login', login);
  app.get('/join', logon);
  app.post('/login', controllers.users.authenticate);
  app.post('/join', controllers.users.create);
  app.get('/user',function(req,res,next){
      console.log(req.user);
  });
};

var isAuthenticated = function(req,res,next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login');
};

function login(req, res, next) {
  res.render('login');
}
function logon(req, res, next) {
  res.render('join');
}
function index(req, res, next) {
	res.render('index', { title: 'Express' });
}
