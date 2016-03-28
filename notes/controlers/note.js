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
            info.flag=true;info.msg='新建note成功。';
            info.notes = new Array();
            info.notes[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    items_TB.find({owner: params.owner}).order('-created').
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.notes=new Array();
            for(var i=0; i<items.length;i++){
                info.notes[i]=items[i].serialize();
                info.notes[i].content=null;
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    items_TB.find({uid: params.uid,owner: params.owner}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err || items.length<1) {
                info.flag=false;info.msg=err.msg;
                return callback(info); 
            }
            info.flag=true;
            info.notes=new Array();
            info.notes[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    items_TB.find({uid: params.uid,owner: params.owner}).
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
            items[0].title=params.title;
            items[0].content=params.content;
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



