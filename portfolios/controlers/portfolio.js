var debug = require('debug')('express:portfolio');

module.exports = {
list   : list,
create : create,
get    : get,
save   : save
}

function create(items_TB, params, callback) {
    debug("portfolio, create: ",params); 
    var info ={flag:false,msg:''};
        items_TB.create(params, function (err, items) {
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;info.msg='新建portfolio成功。';
            info.portfolios = new Array();
            info.portfolios[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    debug("portfolio, list: ",params);    
    items_TB.find({Owner: params.Owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.portfolios=new Array();
            for(var i=0; i<items.length;i++){
                info.portfolios[i]=items[i].serialize();
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    debug("portfolio, get: ",params); 
    items_TB.find({uid: params.uid,Owner: params.Owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err || items.length<1) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.portfolios=new Array();
            info.portfolios[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    debug("portfolio, save: ",params);
    items_TB.find({uid: params.uid,Owner: params.Owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            if(items.length<1){
                info.flag=false;info.msg='不存在此项目。';
                return callback(info);    
            }
            items[0].Name=params.Name;
            items[0].save(function(err){
                if(err){
                    info.flag=false;
                    info.msg=err;
                }
                else{
                    info.flag=true;
                    info.msg='保存成功';
                }
                return callback(info);

            });

        });
}



