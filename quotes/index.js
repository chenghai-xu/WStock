var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var sina = require('./sina');
var http = require('http');
var moment = require('moment');
var database = {models:{}};
var currentQuoteTime = null;
var lastQuoteTime = null;
var lastHistoricalTime = null;
var currentTime = null;
var updateHistoricalFlag = true;

function get_sina(req, res, next) {
    if(req.query.list == undefined){
        res.end("");
    }
    sina.download_sina(req.query.list,function(err,data){
        res.end(data);
    });
}

function update(){
    currentTime = moment();
    update_timeline(function(){
        console.log('Last quote time: %s', lastQuoteTime.format());
        console.log('Last historical date: %s', lastHistoricalTime.format());
        console.log('Current quote time: %s', currentQuoteTime.format());
        console.log('Current time: %s', currentTime.format());
        var dfCurrentQuoteAndNow = currentTime.diff(currentQuoteTime,'minutes');
        var dfCurrentQuoteAndLastHistorical = currentQuoteTime.diff(lastHistoricalTime,'hours');
        console.log('Diff between current quote time and now: %s minutes', dfCurrentQuoteAndNow);
        console.log('Diff between current quote time and last historical date: %s hours', dfCurrentQuoteAndLastHistorical);
        //Now is in trading time.
        database.models.timestamp.find({Name:'quote'}).run(function(err,items){
            if(err){
                console.log(err);
                return;
            }
            if(items.length>0){
                console.log('Last write of quote time: %s',items[0].Write);
            }
            if((items.length<1)||
                (moment(items[0].Write).diff(currentQuoteTime,'minutes')<2)){
                update_quote();
                return;
            }
            console.log('Not need to update quote');

        });
        database.models.timestamp.find({Name:'historical'}).run(function(err,items){
            if(err){
                console.log(err);
                return;
            }
            if(items.length>0){
                console.log('Last write of historical  time: %s',items[0].Write);
            }
            if((items.length<1)||
                (moment(items[0].Write).diff(currentQuoteTime,'hours')>9)){
                //update_historical();
                return;
            }
            console.log('Not need to update historical');

        });
    });
    //update_historical();
    //update_quote();
}
function update_timeline(callback){
    var code = 'SH000001';
    database.models.current_quote.find({Code:code}).run(function(err,quotes){
        if(err){
            console.log(err);
            return;
        }
        lastQuoteTime = moment(quotes[0].Time);
        sina.download_sina(code,function(err,data){
            if(err) {
                console.log(err);
                return;
            }
            sina.text2object(quotes,data);
            currentQuoteTime = moment(quotes[0].Time);
            quotes[0].save(function(err){
                if(err) console.log(err);
            });
            database.models.historical.aggregate({Code:code}).max('Date').get(function(err,lDate){
                lastHistoricalTime = moment(lDate);
                return callback();
            });
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
            console.log('Update quote, time: ', quotes[0].Time);
            for(var i=0; i< quotes.length; i++){
                quotes[i].save(function(err){
                    if(err) console.log(err);
                });
            }
            database.models.timestamp.find({Name:'quote'}).run(function(err,items){
                if(err){
                    console.log(err);
                    return;
                }
                if(items.length<1){
                    database.models.timestamp.create({Name:'quote'},function(error,results){
                        if(error){
                            console.log(error);
                        }
                    });
                    return;
                }
                items[0].Write = moment().toDate() ;
                items[0].save(function(err){
                    if(err){
                        console.log(err);
                    }
                });
            });
        });
    });
}

function connect(){
    orm.connect("sqlite:./data/IStockInfo.db?timezone=Asia/Shanghai", function (err, db) {
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

