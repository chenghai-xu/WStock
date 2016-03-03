var controllers = require('../users/controlers/index');
var quotes = require('./quotes');
module.exports = function (app) {
  app.get('/', index);
  app.get('/quotes', quotes.live);
  app.get('/login', login);
  app.get('/join', logon);
  app.post('/login', controllers.users.get);
  app.post('/join', controllers.users.create);
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
