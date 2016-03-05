var helpers = require('./helpers');
var orm     = require('orm');
var passport = require('passport');
var authenticate = require('../authenticate');

module.exports = {
list   : list_account,
create : creat_account,
get    : get_account
}

function creat_account(Users_TB, params, callback) {
    var info ={flag:false,msg:''};
    Users_TB.find({or:[ {account: params.account},{email: params.email}]}, function (err, users) {
        if (err) {throw err};
        if (users.length>0) {
            info.flag=false;info.msg='账号或邮箱已被注册。';
            //console.log(info);
            return callback(info); 
        }
        Users_TB.create(params, function (err, users) {
            if(err) {throw err;}
            info.flag=true;info.msg='注册成功。';
            //console.log(info);
            return callback(info);
        });
    });
}
function list_account(req, res, next) {
/*
    req.models.users.find().limit(4).order('account').all(function (err, users) {
      if (err) return next(err);

      var items = users.map(function (m) {
        return m.serialize();
      });

      res.send({ items: items });
    });
*/
      res.send("bad!");
}
function get_account(req, res, next) {
    var params = _.pick(req.body, 'account', 'password','email');
    req.models.users.find({or:[ {account: params.account},{email: params.email}]}, function (err, users) {
    });
}


