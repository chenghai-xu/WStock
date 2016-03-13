var http = require('http');
var encoding = require('encoding');
var moment = require('moment');

function download_sina(list, callback) {
    var url = 'http://hq.sinajs.cn/list='+list.toLowerCase();
    console.log('Download Quote: '+url);
    var cont=new Buffer('');
    http.get(url, function(res,msg){
        res.on('data',function(data){
            cont=Buffer.concat([cont,data]);
        });
        res.on('end',function(){
            console.log('Download Quote success.');
            callback(null,encoding.convert(cont,'utf8','gbk').toString());
        });
        res.on('error',function(){
            callback(msg,encoding.convert(cont,'utf8','gbk').toString());
        });
    });
}

function text2object(quotes,text) {
    //var stockListArray = encoding.convert(text,'utf8','gbk').toString().split(';');
    var stockListArray = text.split(';');
    for(var i=0; i<stockListArray.length;i++){
        var es = stockListArray[i].split(/_|="|,|"/);
        if(es.length<5) continue;
           quotes[i].Code      = es[2].toUpperCase();
           quotes[i].Name      = es[3];
           quotes[i].Open      = parseFloat(es[4]);
           quotes[i].Close     = parseFloat(es[5]);
           quotes[i].Current   = parseFloat(es[6]);
           quotes[i].High      = parseFloat(es[7]);
           quotes[i].Low       = parseFloat(es[8]);
           quotes[i].Buy       = parseFloat(es[9]);
           quotes[i].Sell      = parseFloat(es[10]);
           quotes[i].Volume    = parseFloat(es[11]);
           quotes[i].Money     = parseFloat(es[12]);
           quotes[i].BuyPrice  = [parseFloat(es[14]),parseFloat(es[16]),parseFloat(es[18]),parseFloat(es[20]),parseFloat(es[22])];
           quotes[i].BuyVolume = [parseFloat(es[13]),parseFloat(es[15]),parseFloat(es[17]),parseFloat(es[19]),parseFloat(es[21])];
           quotes[i].SellPrice = [parseFloat(es[24]),parseFloat(es[26]),parseFloat(es[28]),parseFloat(es[30]),parseFloat(es[32])];
           quotes[i].SellVolume= [parseFloat(es[23]),parseFloat(es[25]),parseFloat(es[27]),parseFloat(es[29]),parseFloat(es[31])];
           quotes[i].Time      = new Date(es[33]+" "+es[34]);
    }
}

module.exports = {
    download_sina : download_sina,
    text2object : text2object
}
