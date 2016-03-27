var authenticate = require('../users/authenticate');
var quotes = require('../quotes/index');
var notes = require('../notes/index');
var msg2view = require('../views/msg2view');

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
  app.get('/note_book',notes.list_note);
  app.post('/note_book',notes.create_note);
  app.get('/note',notes.get_note);
  app.post('/note',notes.save_note);
  app.get('/edit_note',edit_note);
  app.post('/edit_note',notes.create_note);
};

var isAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){ 
      console.log('access from user: ', req.user);
    }
    else{
      console.log('access from user: ', 'anonymous');
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
function edit_note(req, res, next) {
  render(req,res,next,'edit_note');
}
function user(req, res, next) {
  res.redirect('/');
}
function logout(req, res, next) {
  req.logout();
  res.redirect('/');
}
function render(req,res,next,view){
    res.render(view,msg2view.msg(req));
}

