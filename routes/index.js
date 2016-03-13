var authenticate = require('../users/authenticate');
var quotes = require('../quotes/index');

module.exports = function (app) {
  app.use(isAuthenticated);
  app.get('/', index);
  app.get('/quotes',quotes.quote);
  app.get('/login', login);
  app.get('/join', join);
  app.post('/login', authenticate.login);
  app.post('/join', authenticate.create_account);
  app.get('/logout', logout);
  app.get('/user',user);
  app.get('/note',note);
};

var isAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){ 
      console.log('access from user: ', req.user);
    }
    else{
      console.log('access from user: anonymous.');
    }
    return next();
};

function login(req, res, next) {
  //res.render('login');
  render(req,res,next,'login');
}
function join(req, res, next) {
  render(req,res,next,'join');
  //res.render('join');
}
function index(req, res, next) {
  render(req,res,next,'index');
	//res.render('index', { title: 'Express' });
}
function note(req, res, next) {
  render(req,res,next,'note');
  //res.render('note', { title: 'Express' });
}
function user(req, res, next) {
  res.redirect('/');
}
function logout(req, res, next) {
  req.logout();
  res.redirect('/');
}
function render(req,res,next,view){
  console.log('render: ',req.user);
  res.render(view,{exp_info:{auth:req.isAuthenticated(),user:req.user}});
}