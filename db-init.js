var orm = require("orm");
var setting = require("./config/settings");

var timestamp = require("./quotes/models/timestamp");
var historical = require("./quotes/models/historical");

var portfolio = require("./portfolios/models/portfolio");
var order = require("./portfolios/models/order");
var position = require("./portfolios/models/position");

var moment = require("moment");
var database=null;

function list_timestamp(){
    database.models.timestamp.find().all(function (err, items) {
        if (err) {console.log(err);return;}
        for(var i=0;i<items.lenght;i++){
            console.log(items[i].serialize());
        }
    });
}

function list_datetime(cb){
    database.models.timestamp.find({Name:'quote'}).all(function (err, items) {
        if (err) {console.log(err);return;}
        console.log('list: ',items[0].serialize());
        return cb();
    });
}

function update_datetime(cb){
    database.models.timestamp.find({Name:'quote'}).all(function (err, items) {
        if (err) {console.log(err);return;}
        var t = new Date();
        items[0].Write = moment().toDate();
        items[0].save(function(err){
            if(err) console.log(err);
            console.log('update: ',items[0].serialize());
            return cb();
        });
    });
}

function timestamp_remove(){
    database.models.timestamp.find().remove(function (err) {
        if (err) {console.log(err);return;}
        console.log('remove all items');
    });
}

function list_portfolio(){
    database.models.portfolio.find().all(function (err, items) {
        if (err) {console.log(err);return;}
        for(var i=0;i<items.lenght;i++){
            console.log(items[i].serialize());
        }
    });
}

function list_order(){
    database.models.order.find().all(function (err, items) {
        if (err) {console.log(err);return;}
        for(var i=0;i<items.lenght;i++){
            console.log(items[i].serialize());
        }
    });
}

function list_position(){
    database.models.position.find().all(function (err, items) {
        if (err) {console.log(err);return;}
        for(var i=0;i<items.lenght;i++){
            console.log(items[i].serialize());
        }
    });
}
function connect_quotes(cb)
{
	orm.connect(setting.quotes, function (err, db) {
	    if (err) throw err;
	    database=db;
	    database.models={};
	    database.models.timestamp = timestamp(db);
	    database.models.historical = historical(db);
	    db.sync(function(err) { 
	        if (err) throw err;
		return cb();
	    });
	});
}
function connect_portfolios(cb)
{
	orm.connect(setting.portfolios, function (err, db) {
	    if (err) throw err;
	
	    database=db;
	    database.models={};
	    database.models.portfolio = portfolio(db);
	    database.models.order = order(db);
	    database.models.position = position(db);
	    db.sync(function(err) { 
		    if (err) throw err;
		    list_portfolio();
		    list_order();
		    list_position();
		    return cb();
	    });
	});
}
connect_quotes(function(){
	connect_portfolios(function(){
		console.log("End");
		}
	);
	}
);
