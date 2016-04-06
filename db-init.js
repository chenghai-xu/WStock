var orm = require("orm");
var timestamp = require("./quotes/models/timestamp");
var historical = require("./quotes/models/historical");
var moment = require("moment");
var database=null;
function list(){
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
        //items[0].Write = new Date(t.getFullYear(),t.getMonth(),t.getDate());
        items[0].save(function(err){
            if(err) console.log(err);
            console.log('update: ',items[0].serialize());
            return cb();
        });
    });
}

function remove(){
    database.models.timestamp.find().remove(function (err) {
        if (err) {console.log(err);return;}
        console.log('remove all items');
    });
}

orm.connect("sqlite:./data/IStockInfo.db?debug=true&timezone=Asia/Shanghai", function (err, db) {
    if (err) throw err;

    database=db;
    database.models={};
    //var Person = timestamp(db);
    database.models.timestamp = timestamp(db);
    database.models.historical = historical(db);
    db.sync(function(err) { 
        if (err) throw err;
    });
    //list();
    update_datetime(function(){});
    console.log('list first.');
    list_datetime(function(){

        console.log('update');
        update_datetime(function(){

            console.log('list again.');
            list_datetime(function(){
            });
        });
    });
    var code = 'SH000001';
    database.models.historical.aggregate({Code:code}).max('Date').get(function(err,lDate){
        console.log(lDate);
    });
    //remove();
    /*
    Person.find().all(function (err, timestamp) {
        if (err) {console.log(err);return;}

        var items = timestamp.map(function (m) {
            return m.serialize();
        });

        console.log(items);
    });
    */
});
