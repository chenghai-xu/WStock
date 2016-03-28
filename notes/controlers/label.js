module.exports = {
list   : list,
create : create,
get    : get,
find   : find
}

function create(items_TB, params, callback) {
    var info ={flag:false,msg:''};
    //console.log('there');
    items_TB.create(params, function (err, items) {
        if(err) {
            info.flag=false;info.msg=err.msg;
            return callback(info); 
        }
        info.flag=true;info.msg='新建标签成功。';
        info.labels = new Array();
        for(var i=0; i<items.length;i++){
            info.labels[i] = items[i].serialize();
        }
        return callback(info);
    });
}
function list(items_TB, params, callback) {
    items_TB.find({owner: params.owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.labels=new Array();
            for(var i=0; i<items.length;i++){
                info.labels[i]=items[i].label;
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    items_TB.find({uid: params.uid,owner: params.owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.labels=new Array();
            for(var i=0; i<items.length;i++){
                info.labels[i]=items[i].label;
            }
            return callback(info);
        });
}

function find(items_TB, params, callback) {
    items_TB.find(params).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.labels=new Array();
            for(var i=0; i<items.length;i++){
                info.labels[i]=items[i].serialize();
            }
            return callback(info);
        });
}
