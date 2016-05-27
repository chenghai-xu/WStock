module.exports = {
list   : list,
create : create,
get    : get,
save   : save
}

function create(items_TB, params, callback) {
    var info ={flag:false,msg:''};
        items_TB.create(params, function (err, items) {
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;info.msg='新建netvalue成功。';
            info.netvalues = new Array();
            info.netvalues[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.netvalues=new Array();
            for(var i=0; i<items.length;i++){
                info.netvalues[i]=items[i].serialize();
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    items_TB.find({uid: params.uid,Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err || items.length<1) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.netvalues=new Array();
            info.netvalues[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    items_TB.find({uid: params.uid,Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            if(items.length<1){
                info.flag=false;info.msg='不存在此项目。';
                return callback(info);    
            }
	    items[0].Value           = params.Value           ;
	    items[0].save(function(err){
                if(err){
                    info.flag=false;
                    info.msg=err.msg;
                }
                else{
                    info.flag=true;
                    info.msg='保存成功';
                }
                return callback(info);

            });

        });
}



