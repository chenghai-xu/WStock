var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var sina = require('./sina');
var moment = require('moment');
var database = {models:{}};

var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter();

function get_sina(req, res, next) {
  if(req.query.list == undefined){
    res.end("");
  }
  sina.download_sina(req.query.list,function(err,data){
    res.end(data);
  });
}

function update(){
  control.historical.set_db(database);
  control.historical.update_control();
  control.current_quote.set_db(database);
  control.current_quote.update_control();
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

function connect(){
  orm.connect(settings.quotes, function (err, db) {
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
      event.emit('ready',database);
      update();
    });
  });
}

function bind(app){
	app.use(function(req, res, next) {
		req.models.historical=database.models.historical;
		req.models.current_quote=database.models.current_quote;
		req.models.index_code=database.models.index_code;
		next();
	});
}

module.exports = {
  models: database.models,
  init: connect,
  quote: get_sina,
  control:control,
  bind : bind,
  event:event
};

