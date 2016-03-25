module.exports = {
list   : list,
create : creat,
get    : get
}

function creat(Users_TB, params, callback) {
    var info ={flag:false,msg:''};
        Users_TB.create(params, function (err, users) {
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;info.msg='新建note成功。';
            return callback(info);
        });
}
function list(Users_TB, params, callback) {
    Users_TB.find({owner: params.owner}).
        omit("content","owner").
        run(function (err, users) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.notes=new Array();
            for(var i=0; i<users.length;i++){
                info.notes[i]=users[0].clip();
            }
            return callback(info);
        });
}
function get(Users_TB, params, callback) {
    Users_TB.find({uid: params.uid,owner: params.owner}).
        omit("owner").
        run(function (err, users) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.notes=new Array();
            info.notes[0]=users[0].serialize();
            return callback(info);
        });
}


