var moment = require('moment');
var sina = require('../sina');
var database = null;

module.exports = {
update_control : update_control,
update : update,
set_db : set_db
};
function set_db(db){
    database=db;
}

function update_control(){
  var code = 'SH000001';
  database.models.historical.aggregate({Code:code}).max('Date').get(function(err,lDate){
    if(err){
      console.log(err);
      setTimeout(update_control,60*1000);
      return;
    }
    var lastHistoricalTime = moment(lDate);
    var start = moment().add(-20,'days');
    var end = moment();
    sina.historical_163(code,start,end,function(historicals){
      if(historicals.length<1){
        setTimeout(update_control,60*1000);
        return;
      }
      var currentHistoricalTime = moment(historicals[historicals.length-1].Date);
      console.log('Last historical time: ', lastHistoricalTime.format());
      console.log('Current historical time: ', currentHistoricalTime.format());
      if(lastHistoricalTime.diff(currentHistoricalTime) == 0){
        console.log('Historical update is not need.');
      }
      else{
        console.log('Historical update is need.');
        update();
      }
      var dt = moment();
      var h =  23 - dt.hour();
      var m =  59 - dt.minute();
      var s =  60 - dt.second();
      console.log('Historical update will be checked again at next 00:01 AM, after %s hours, %s minutes, %s seconds',h,m,s);
      setTimeout(update_control,(h*3600+m*60+s)*1000);
    });
  });
}

function update(){
  database.models.current_quote.find().only('Code').run(function(err,quotes){
    var count = 0;
    var code_number = quotes.length;
    var all_historicals = new Array();
    for(var i=0; i< quotes.length; i++){
      update_each(quotes[i].Code,function(historicals){
        all_historicals = all_historicals.concat(historicals);
        count++;
        console.log('Total codes: %s, downloaded codes: %s, current historicals: %s, total historicals:%s ',
          code_number,count,historicals.length,all_historicals.length);
        if(count==code_number){
          console.log('All %s codes historicals is ready. We can insert them now.', code_number);
          database.driver.execQuery('BEGIN TRANSACTION;', function (err, data) {
            database.models.historical.create(all_historicals,function(err,items){
              if(err){
                console.log(err);
              }
              database.driver.execQuery('COMMIT TRANSACTION;', function (err, data) {
                console.log('Update historical: COMMIT TRANSACTION;');
              });
            });
          });
        }
      });
    }
  });
}

function update_each(code, callback)
{
  var full_flag=false;var prefix=code.substr(2,1);
  if(prefix != 0 && prefix != 3 && prefix != 6){
    full_flag=true;
  }
  database.models.historical.aggregate({Code:code}).max('Date').get(function(err,lDate){
    var download = null;
    var end = moment(moment().format('YYYY-MM-DD'));
    var start = null;
    if(!lDate){
      start=moment('1970-01-01');
    }
    else{
      start=moment(lDate).add(1,'days');
    }

    if(err){
      console.log(err);
    }
    else if(!lDate || full_flag){
      download = sina.historical_xueqiu;
    }
    else{
      download = sina.historical_163;
    }
    download(code,start,end,callback);
  });  
}

