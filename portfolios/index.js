var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var moment = require('moment');
var database = {models:{}};

function connect(){
  orm.connect(settings.quotes, function (err, db) {
    if (err) throw err;
    database = db;
    database.models.portfolio = models.portfolio(db);
    database.models.order = models.order(db);
    database.models.position = models.position(db);
    db.sync(function(err) { 
      if (err) throw err;
      database.models.portfolio.count(function (err, count) {
        if (err) {console.log(err);return;}
        console.log("Init models of portfolio. count: %s",count);
      });
      database.models.position.count(function (err, count) {
        if (err) {console.log(err);return;}
        console.log("Init models of position. count: %s",count);
      });
      database.models.order.count(function (err, count) {
        if (err) {console.log(err);return;}
        console.log("Init models of order. count: %s",count);
      });
      update();
    });
  });
}

function portfolios(req, res, next) {
    var info={flag:false,msg:'请先登录。'};
    if(!req.isAuthenticated()){
        return res.json(info);
    }
}
module.exports = {
  models: database.models,
  init: connect,
  portfolios: portfolios
};

