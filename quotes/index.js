var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var sina = require('./sina');
var http = require('http');
var database = {models:{}};

function get_sina(req, res, next) {
    if(req.query.list == undefined){
        res.end("");
    }
    sina.download_sina(req.query.list,function(err,data){
        res.end(data);
    });
}
function update_quote()
{
    database.models.current_quote.find().only('Code').run(function(err,quotes){
        var list=[];
        for(var i=0; i< quotes.length; i++){
            list[i]=quotes[i].Code;
        }
        sina.download_sina(list.join(',').toLowerCase(),function(err,data){
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
        });
    });
}

function connect(){
    orm.connect("sqlite:./data/IStockInfo.db", function (err, db) {
        if (err) throw err;
        database = db;
        database.models.current_quote = models.current_quote(db);
        database.models.historical = models.historical(db);
        database.models.index_code = models.index_code(db);
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
        });

    });
    setTimeout(update_quote,5000);
}

module.exports = {
    models: database.models,
    init: connect,
    quote: get_sina
};

