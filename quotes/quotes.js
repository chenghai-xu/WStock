var http = require('http');
function get_sina(req, res, next) {
    if(req.query.list == undefined){
        res.end("");
    }
    var url = 'http://hq.sinajs.cn/list='+req.query.list;
    console.log('REGET: '+url);
    var cont=""
    http.get(url, function(reres,msg){
        reres.on('data',function(data){
            cont+=data;
        });
        reres.on('end',function(){
            console.log('REGET success.');
            res.end(cont);
        });
        reres.on('error',function(){
            res.end('error: '+msg);
        });
    });
}

module.exports = {
live : get_sina
}
