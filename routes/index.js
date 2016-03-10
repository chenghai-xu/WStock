var authenticate = require('../users/authenticate');
var quotes = require('../quotes/index');

module.exports = function (app) {
  app.get('/', index);
  app.get('/quotes',quotes.quote);
  app.get('/login', login);
  app.get('/join', logon);
  app.post('/login', authenticate.login);
  app.post('/join', authenticate.create_account);
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
