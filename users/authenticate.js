var passport = require('passport');
var controllers = require('./controlers/index');
var LocalStrategy = require('passport-local').Strategy;
var _= require('lodash');
var Users = null;

function validate(account, password, done) {
    Users.find({ account: account },function(err, users) {
        if (err) { return done(err); }
        if (users.length<1) {
            //console.log('用户名不存在.' );
            return done(null, false, {flag:false, msg: '账号不存在。'});
        }
        if (users[0].password!=password) {
            //console.log('密码不匹配.' );
            return done(null, false, {flag:false,  msg: '密码不匹配。'});
        }
        //console.log('验证成功.' );
        return done(null, users[0],{flag:true,msg:'登陆成功。'});
    });
}

function create_account(req, res, next){
  var params = _.pick(req.body, 'account', 'password','email');
  console.log("create account: %s, %s.",params.account,params.email);
  controllers.users.create(req.models.users,params,function(created){
    if(!created.flag){
      var info={join:created,login:null};
      console.log(info);
      return res.json(info);
    }
    auth(req,res,next,function(authed){
      var info={join:created,login:authed};
      console.log(info);
      res.json(info);
    });
  });
}

function init() {
    passport.use(new LocalStrategy({
        usernameField: 'account',
        passwordField: 'password'
    }, validate));
    passport.serializeUser(function(user,done){
        done(null,user.uid);
    });
    passport.deserializeUser(function(account,done){
        Users.find({account:account},function(err,users){
            if(err) { return done(err); }
            if(users.length<1) {return done(err,"anonymous");}
            done(err,users[0].uid);
        });
    });

}


function bind(app) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next) {
        //console.log("session: ",req.session);
        next();
    });
    app.use(function(req, res, next) {
        Users = req.models.users;
        next();
    });
}

function auth(req, res, next, callback) {
    var pass_cb = passport.authenticate('local', function(err, user, info) {
        //console.log("authenticate. err: %s, user: %s, info: ",err,user,info);
        if (err) { throw err;}
        if (!user) { return callback(info);}
        req.logIn(user, function(err) {
            if (err) { return callback(err); }
            //console.log("session: ",req.session);
            return callback(info);
        });
    });
    pass_cb(req,res,next);
}

function login(req,res,next){
    auth(req,res,next,function(authed){
      var info={login:authed};
      console.log(info);
      res.json(info);
  });
}

module.exports = {
    init: init,
    bind: bind,
    login:login,
    create_account: create_account
};
