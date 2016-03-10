module.exports = {
list   : list_account,
create : creat_account,
get    : get_account
}

function creat_account(Users_TB, params, callback) {
    var info ={flag:false,msg:''};
        Users_TB.create(params, function (err, users) {
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;info.msg='注册成功。';
            return callback(info);
        });
}
function list_account(req, res, next) {
      res.send("bad!");
}
function get_account(req, res, next) {
    var params = _.pick(req.body, 'account', 'password','email');
    req.models.users.find({or:[ {account: params.account},{email: params.email}]}, function (err, users) {
    });
}


