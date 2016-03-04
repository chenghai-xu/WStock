var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Users = null;

function validate(account, password, done) {
    Users.find({ account: account },function(err, users) {
        if (err) { return done(err); }
        if (users.length<1) {
            //console.log('用户名不存在.' );
            return done(null, false, {auth:false, message: '用户名不存在.'});
        }
        if (users[0].password!=password) {
            //console.log('密码不匹配.' );
            return done(null, false, {auth:false,  message: '密码不匹配.'});
        }
        //console.log('验证成功.' );
        return done(null, users[0]);
    });
}

module.exports.init = function () {
    passport.use(new LocalStrategy({
        usernameField: 'account',
        passwordField: 'password'
    }, validate
    ));
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

};
module.exports.bind = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(function(req, res, next) {
        console.log("session: ",req.session);
        next();
    });
    app.use(function(req, res, next) {
        Users = req.models.users;
        next();
    });
};
