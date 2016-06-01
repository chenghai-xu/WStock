var moment = require('moment');
var sina = require('../sina');
var database = null;
var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter();


module.exports = {
update_control : update_control,
update : update,
set_db : set_db,
event  : event
};
function set_db(db){
    database=db;
}

function update_control(){
  var code = 'SH000001';
  database.models.current_quote.find({Code:code}).run(function(err,quotes){
    if(err){
      console.log(err);
      setTimeout(update_control,60*1000);
      return;
    }
    var lastQuoteTime = moment(quotes[0].Time);
    sina.download_sina(code,function(err,data){
      if(err) {
        setTimeout(update_control,60*1000);
        console.log(err);
        return;
      }
      sina.text2object(quotes,data);
      var currentQuoteTime = moment(quotes[0].Time);
      console.log('Last quote time: %s', lastQuoteTime.format());
      console.log('Current quote time: %s', currentQuoteTime.format());
      var dfQuotes = currentQuoteTime.diff(lastQuoteTime,'seconds');
      if(dfQuotes!=0){
        console.log('Quote update is need.');
        update();
      }
      var currentQuoteHours = currentQuoteTime.hour() + currentQuoteTime.minute()/60.0+currentQuoteTime.second()/3600.0;
      if(currentQuoteHours>15&&dfQuotes==0){
        var dt = moment();
        var h =  23 - dt.hour()+9;
        var m =  59 - dt.minute()+20;
        var s =  60 - dt.second();
        console.log('Quote update will be checked again at next 9:20 AM, after %s hours, %s minutes, %s seconds',h,m,s);
        setTimeout(update_control,(h*3600+m*60+s)*1000);
        return;
      }
      console.log('Quote update will be checked again after 60 seconds.');
      setTimeout(update_control,60*1000);
    });
  });
}

function update()
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
      database.driver.execQuery('BEGIN TRANSACTION;', function (err, data) {
        var count=0;
        for(var i=0; i< quotes.length; i++){
          quotes[i].save(function(err){
            if(err) {console.log(err);}
            count++;
            if(count==quotes.length){
              database.driver.execQuery('COMMIT TRANSACTION;', function (err, data) {
                console.log('Update Quote: COMMIT TRANSACTION;');
		emit_update(quotes);
              });
            }
          });
        }
      });
    });
  });
}
function emit_update(quotes){
	console.log('event: current_quote, update');
	event.emit('update', quotes);
}

