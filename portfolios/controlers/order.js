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
            info.flag=true;info.msg='新建order成功。';
            info.orders = new Array();
            info.orders[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio}).order('-created').
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.orders=new Array();
            for(var i=0; i<items.length;i++){
                info.orders[i]=items[i].serialize();
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
            info.orders=new Array();
            info.orders[0]=items[0].serialize();
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
	    items[0].Time   = params.Time  ;        
	    items[0].Code   = params.Code  ;        
	    items[0].Name   = params.Name  ;        
	    items[0].Type   = params.Type  ;        
	    items[0].Price  = params.Price ;        
	    items[0].Volume = params.Volume;        
	    items[0].Fee    = params.Fee   ;        
	    items[0].Amount = params.Amount;        

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


