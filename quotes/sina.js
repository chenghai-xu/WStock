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
var returnFlag = false;
if(!quotes){
  quotes = new Array();
  for(var i=0; i< stockListArray.length;i++){
    quotes[i]={};
  }
  returnFlag = true;
}
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
if(returnFlag){
  return quotes;
}
}

function historical_xueqiu(stock,start,end,callback){
  var code = stock.toUpperCase();
  var cont=new Buffer('');
  var url = 'http://xueqiu.com/S/' + code + '/historical.csv';
  http.get(url, function(res,msg){
    res.on('data',function(data){
      cont=Buffer.concat([cont,data]);
    });
    res.on('end',function(){
    //console.log('Download historical success, url: %s',url);
      callback(decode_historical_xueqiu(stock,start,end,encoding.convert(cont,'utf8','gbk').toString()));
    });
    res.on('error',function(){
      console.log('Download historical error, url: %s',url);
      callback(decode_historical_xueqiu(stock,start,end,encoding.convert(cont,'utf8','gbk').toString()));
    });
  });
}
function decode_historical_xueqiu(code,start,end,data){
  data=data.replace(/"/g,'');
  var rows = data.split("\n");
  var historicals = new Array();
  if(rows.length<2){
    return historicals;
  }
  for(var i=1; i<rows.length;i++){
    var row = rows[i].split(',');
    row[1] += ' 00:00:00';
    if(row.length<7 || moment(row[1])<moment(start)){
      continue;
    }
    historicals.push({Code:code,
      Date: new Date(row[1]),
      Open: parseFloat(row[2]),
      High: parseFloat(row[3]),
      Low:  parseFloat(row[4]),
      Close: parseFloat(row[5]),
      Volume: parseFloat(row[6])
    });
  }
  return historicals;
} 

function historical_163(stock,start,end,callback) {
  var prefix = stock.substring(0,2).toUpperCase();
  var code = null;
  if(prefix=='SH'){
    code = '0'+ stock.substring(2,8);
  }
  else if(prefix=='SZ'){
    code = '1'+ stock.substring(2,8);
  }
  else{
  }
  var url ='http://quotes.money.163.com/service/chddata.html';
  var query = '?';
  query += 'code=' + code +'&';
  query += 'start=' + start.format('YYYYMMDD') +'&';
  query += 'end=' + end.format('YYYYMMDD') +'&';
  query += 'fields=TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;VOTURNOVER;VATURNOVER';
  url += query;

  var cont=new Buffer('');
  http.get(url, function(res,msg){
    res.on('data',function(data){
      cont=Buffer.concat([cont,data]);
    });
    res.on('end',function(){
    //console.log('Download historical success, url: %s',url);
      callback(decode_historical_163(stock,encoding.convert(cont,'utf8','gbk').toString()));
    });
    res.on('error',function(){
      console.log('Download historical error, url: %s',url);
      callback(decode_historical_163(stock,encoding.convert(cont,'utf8','gbk').toString()));
    });
  });
}

function decode_historical_163(code,data){
  var rows = data.split("\n");
  var historicals = new Array();
  if(rows.length<2){
    return historicals;
  }
  for(var i=rows.length-1; i>0;i--){
    var row = rows[i].split(',');
    row[1] += ' 00:00:00';
    if(row.length<11){
      continue;
    }
    historicals.push({Code:code,
      Date: new Date(row[0]),
      Open: parseFloat(row[6]),
      High: parseFloat(row[4]),
      Low:  parseFloat(row[5]),
      Close: parseFloat(row[3]),
      Volume: parseFloat(row[10])
    });
  }
  return historicals;
}


module.exports = {
  download_sina : download_sina,
  historical_163 : historical_163,
  historical_xueqiu : historical_xueqiu,
  text2object : text2object
}
