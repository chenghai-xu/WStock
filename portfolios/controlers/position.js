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
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;info.msg='新建position成功。';
            info.positions = new Array();
            info.positions[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.positions=new Array();
            for(var i=0; i<items.length;i++){
                info.positions[i]=items[i].serialize();
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    items_TB.find({uid: params.uid,Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err || items.length<1) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.positions=new Array();
            info.positions[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio, Code: params.Code}).
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
	    items[0].Volume          = params.Volume          ;
	    items[0].Current_Price   = params.Current_Price   ;
	    items[0].Current_Amount  = params.Current_Amount  ;
	    items[0].Cost_Price      = params.Cost_Price      ;
	    items[0].Cost_Amount     = params.Cost_Amount     ;
	    items[0].Gain            = params.Gain            ;
	    items[0].Gain_Rate       = params.Gain_Rate       ;
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



