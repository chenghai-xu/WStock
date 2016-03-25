var authenticate = require('../users/authenticate');
var quotes = require('../quotes/index');
var notes = require('../notes/index');

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
  app.get('/note',list_note);
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
function list_note(req, res, next) {
    if(req.isAuthenticated()){ 
        //notes.controlers.note.list(notes.models().note,{owner:req.user.uid},function(info){
        notes.controlers.note.list(req.models.note,{owner:req.user.uid},function(info){
            if(!info.flag){
                res.redirect('/');
                return;
            }
            var view_info = view_json(req);
            view_info.notes = info.notes;
            console.log(view_info);
            res.render('note',view_info);
        });
    }
    else{
        res.redirect('/');
    }
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
    res.render(view,view_json(req));
}

function view_user(req){
    var user = {auth: req.isAuthenticated(), account: 'anonymous'};
    if(req.isAuthenticated()){
        user.account=req.user.account;
    }
    return user;
}

function view_json(req){
    var json={};
    json.user=view_user(req);
    return json;
}

