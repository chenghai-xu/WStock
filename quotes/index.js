var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var sina = require('./sina');
var http = require('http');
var moment = require('moment');
var database = {models:{}};

function get_sina(req, res, next) {
    if(req.query.list == undefined){
        res.end("");
    }
    sina.download_sina(req.query.list,function(err,data){
        res.end(data);
    });
}

function update(){
    update_historical_control();
    update_quote_control();
}

function update_netvalue_control(){
    var code = 'SH000001';
    database.models.current_quote.find({Code:code}).run(function(err,quotes){
        var currentNetValueTime = moment(quotes[0].Time);
	var lastNetValueTime = moment().add(-1,'days');
	console.log('Last net value day: %s', lastNetValueTime.format());
	console.log('Current net value day: %s', currentNetValueTime.format());
    });
}
function update_quote_control(){
    var code = 'SH000001';
    database.models.current_quote.find({Code:code}).run(function(err,quotes){
        if(err){
            console.log(err);
	    setTimeout(update_quote_control,60*1000);
            return;
        }
        var lastQuoteTime = moment(quotes[0].Time);
        sina.download_sina(code,function(err,data){
            if(err) {
	    	setTimeout(update_quote_control,60*1000);
                console.log(err);
                return;
            }
            sina.text2object(quotes,data);
            var currentQuoteTime = moment(quotes[0].Time);
	    console.log('Last quote time: %s', lastQuoteTime.format());
	    console.log('Current quote time: %s', currentQuoteTime.format());
            var dfQuotes = currentQuoteTime.diff(lastQuoteTime,'seconds');
	    if(dfQuotes>20){
	    	console.log('Quote update is need.');
		update_quote();
	    }
	    var currentQuoteHours = currentQuoteTime.hour() + currentQuoteTime.minute()/60.0+currentQuoteTime.second()/3600.0;
	    if(currentQuoteHours>15&&dfQuotes==0){
	    	var dt = moment();
	    	var h =  23 - dt.hour()+9;
	    	var m =  59 - dt.minute()+20;
	    	var s =  60 - dt.second();
	    	console.log('Quote update will be chekced again at next 9:20 AM, after %s hours, %s minutes, %s seconds',h,m,s);
	  	setTimeout(update_quote_control,(h*3600+m*60+s)*1000);
		return;
	    }
	    console.log('Quote update will be chekced again 20 seconds.');
	    setTimeout(update_quote_control,20*1000);
        });
    });
}
function update_historical_control(){
  var code = 'SH000001';
  database.models.historical.aggregate({Code:code}).max('Date').get(function(err,lDate){
        if(err){
            console.log(err);
	    setTimeout(update_historical_control,60*1000);
	    return;
	}
      	var lastHistoricalTime = moment(lDate);
	var start = moment().add(-20,'days');
	var end = moment();
	sina.historical_163(code,start,end,function(historicals){
	  if(historicals.length<1){
	  	setTimeout(update_historical_control,60*1000);
	  	return;
	  }
	  var currentHistoricalTime = moment(historicals[0].Date);
	  console.log('Last historical time: ', lastHistoricalTime.format('YYYY-MM-DD'));
	  console.log('Current historical time: ', currentHistoricalTime.format('YYYY-MM-DD'));
	  if(lastHistoricalTime == currentHistoricalTime){
	  	console.log('Historical need not update.');
	  }
	  var dt = moment();
	  var h =  23 - dt.hour();
	  var m =  59 - dt.minute();
	  var s =  60 - dt.second();
	  console.log('Historical update is need.');
	  console.log('Historical update will be chekced again at next 00:01 AM, after %s hours, %s minutes, %s seconds',h,m,s);
	  update_historical();
	  setTimeout(update_historical_control,(h*3600+m*60+s)*1000);
	  });
    });
}

function update_historical(){
    database.models.current_quote.find().only('Code').run(function(err,quotes){
        var code = '';
        for(var i=0; i< quotes.length; i++){
            code=quotes[i].Code;
        }
    });
}
function update_quote()
{
    database.models.current_quote.find().run(function(err,quotes){
        var list=[];
        for(var i=0; i< quotes.length; i++){
            list[i]=quotes[i].Code;
        }
        sina.download_sina(list.join(','),function(err,data){
            if(err) {
                console.log(err);
                return;
            }
            sina.text2object(quotes,data);
            for(var i=0; i< quotes.length; i++){
                quotes[i].save(function(err){
                    if(err) console.log(err);
                });
            }
            console.log('Update quote success.');
        });
    });
}

function connect(){
    orm.connect(settings.quotes, function (err, db) {
        if (err) throw err;
        database = db;
        database.models.current_quote = models.current_quote(db);
        database.models.historical = models.historical(db);
        database.models.index_code = models.index_code(db);
        database.models.timestamp = models.timestamp(db);
        db.sync(function(err) { 
            if (err) throw err;
            database.models.current_quote.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of Current_Quote. count: %s",count);
            });
            database.models.index_code.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of Index_Code. count: %s",count);
            });
            database.models.historical.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of Historical. count: %s",count);
            });
            database.models.timestamp.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of timestamp. count: %s",count);
            });
            update();
        });

    });
}

module.exports = {
    models: database.models,
    init: connect,
    quote: get_sina
};

