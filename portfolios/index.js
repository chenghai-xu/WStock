'use strict'
var router = require('express').Router();
var orm      = require('orm');
var moment = require('moment');
var debug = require('debug')('express:portfolios');

var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var msg2view = require('../views/msg2view');
var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter();

var database = {models:{}};
var cash_code = 'CASH';
var cash_name = '现金';

var quotes_db = null;

function connect(){
  orm.connect(settings.portfolios, function (err, db) {
    if (err) throw err;
    database = db;
    database.models.portfolio = models.portfolio(db);
    database.models.order = models.order(db);
    database.models.position = models.position(db);
    database.models.netvalue = models.netvalue(db);
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
      database.models.netvalue.count(function (err, count) {
        if (err) {console.log(err);return;}
        console.log("Init models of netvalue. count: %s",count);
      });
    });
  });
}

router.get('/',function(req, res) {
  control.portfolio.list(database.models.portfolio,{User:req.user.uid},function(info){
    if(!info.flag){
      res.redirect('/');
      return;
    }
    var view_info = msg2view.msg(req);
    view_info.portfolios = info.portfolios;
    res.render('portfolios',view_info);
  });
});

function is_owned_portfolio(params,cb)
{
  control.portfolio.get(database.models.portfolio,params,function(portfolio_info){
	if(!portfolio_info.flag){
	      return cb(null);
	}
	if(portfolio_info.portfolios.length<1) {
	      return cb(null);
  	}
	return cb(portfolio_info.portfolios[0]);
  });
}

router.post('/portfolio',function(req,res){
  if(req.query.action=='new'){
    var params = {
        User: req.user.uid,
        Name: req.body.Name};
    debug("create portfolio: ",params);
    control.portfolio.create(database.models.portfolio,params,function(info){
	    return res.json(info);

    });
  }
  else if(req.query.action=='edit'){
    var params = {
        uid: req.body.uid,
        User: req.user.uid,
        Name: req.body.Name};
    debug("edit portfolio: ",params);
    control.portfolio.save(database.models.portfolio,params,function(info){
        return res.json(info);

    });    
  }
});

router.get('/order',function(req, res) {
  if(req.query.portfolio==null){
	res.redirect('/');
  }
  debug("list order, user: %s, portfolio: %",req.user.uid,req.query.portfolio);
  is_owned_portfolio({uid:req.query.portfolio,User:req.user.uid},function(portfolio){
        var view_info = msg2view.msg(req);
	view_info.orders=[];
	view_info.portfolio=req.query.portfolio;
	if(portfolio == null){
		return res.redirect('/portfolios');
	}
  	control.order.list(database.models.order,{Portfolio:req.query.portfolio},function(order_info){
  	  if(!order_info.flag){
  	      	debug("list order error.");
		return res.redirect('/portfolios');
  	  }
  	  view_info.orders = order_info.orders;
  	  res.render('orders',view_info);
  	});
  });
});

router.post('/order',function(req, res) {
  var view_info = msg2view.msg(req);
  view_info.flag = false;
  view_info.msg = "invalid portfolio value";
  debug("create order, user: ",req.user.uid, ', portfolio: ', req.body.Portfolio);
  if(req.body.Portfolio==null){
  	debug(view_info.msg);
	res.json(view_info);
  }
  database.models.portfolio.find({uid:req.body.Portfolio,User:req.user.uid},function(err,items){
  	view_info.msg = "invalid portfolio or user";
	if(err){
  		debug(view_info.msg);
		return res.json(view_info);
	}
	var portfolio = items[0];
	debug("pass portfolio validation");

	view_info.msg = "invalid query parameters";
  	if(req.query.action!='new'){
  		debug(view_info.msg);
		return res.json(view_info);
  	}
  	debug("to create orders, trade them first.");

	trade_orders(req,portfolio,function(pos_new,order_good,bad_orders){
		debug("only save traded orders:");
		var result = {};
		result.flag = true;
		if(result.length>0){
			result.flag = false;
		}
		result.bad = bad_orders;
		return res.json(result);
	});

  });
});

function order_sort(a,b){
	return moment(a.Time).unix() - moment(b.Time).unix();
}

function trade_orders(req,portfolio,cb){
  	req.models.position.find({Portfolio:portfolio.uid},function(err,positions){
  	  if(err) throw err;
	  var sorted_orders = req.body.orders.sort(order_sort);
	  for(var i=0; i<sorted_orders.length;i++)
	  {
		control.order.complete_order(sorted_orders[i]);
	  }
	  var order_good = [];
	  var order_bad = [];
	  var pos_map = new Map();
	  debug('current portfolio time: ',portfolio.Order_Time);
	  debug('current position: Code, Volume');
	  for(var i=0;i<positions.length;i++){
	  	pos_map.set(positions[i].Code,positions[i]);
	        debug(positions[i].Code,', ',positions[i].Volume);
	  }
	  var j=sorted_orders.length;
	  console.log('trade order: time, code, volume,amount');
	  for(var i=0; i<sorted_orders.length;i++)
	  {
	  	console.log(sorted_orders[i].Time,', ',sorted_orders[i].Code , ', ', 
			sorted_orders[i].Volume, ', '+ sorted_orders[i].Amount);
		var dt_p = moment(portfolio.Order_Time);
		var dt_o = moment(sorted_orders[i].Time);
	  	var result=null;
		if(dt_p.unix()-dt_o.unix()>=0){
			result = control.position.trade_status();
			result.flag=false;
			result.msg='Order time is before portfolio time.';
		}
		else{
	  	    result=control.position.do_trade_each(pos_map,sorted_orders[i]);
		}
	  	console.log('trade order result: ',result);
	  	if(!result.flag){
			j=i;
	  		break;
		}
		control.netvalue.new_order(req,pos_map,control.position,sorted_orders[i]);
		portfolio.Order_Time = sorted_orders[i].Time;
	  	debug('update portfolio order time: ',portfolio.Order_Time);
		for(let code of result.Codes){
	  		debug('position changed, code: ',pos_map.get(code).Code,
				', volume: ',pos_map.get(code).Volume);
		}
		order_good.push(sorted_orders[i]);
	  }
	  for(var i=j;i<sorted_orders.length;i++) {
		  order_bad.push(sorted_orders[i]);
	  }

	  if(order_good.length>0){
		  //insert orders.
		  //update portfolio Order_Time.
		  //update position.
		  req.models.order.create(order_good,function(err, items){
			  if(err) throw err;
		  });
		  control.position.create_or_save_position(req,portfolio,pos_map);
		  portfolio.save(function(err){
			  if(err) throw err;
		  });
	  }
	  return cb(order_bad);
  	  });
}

router.get('/position',function(req, res) {
  if(req.query.portfolio==null){
	res.redirect('/');
  }
  debug("list position, user: %s, portfolio: %",req.user.uid,req.query.portfolio);
  is_owned_portfolio({uid:req.query.portfolio,User:req.user.uid},function(flag){
        var view_info = msg2view.msg(req);
	view_info.positions=[];
	view_info.portfolio=req.query.portfolio;
	if(!flag){
		return res.redirect('/portfolios');
	}
  	control.position.list(database.models.position,{Portfolio:req.query.portfolio},function(position_info){
  	  if(!position_info.flag){
  	      	debug("list position error.");
		return res.redirect('/portfolios');
  	  }
	  debug('list position: code, volume');
	  for(var i=0; i< position_info.positions.length;i++){
	  	debug(position_info.positions[i].Code, position_info.positions[i].Volume);
	  }
  	  view_info.positions = position_info.positions;
	  if(req.query.get){
		  return res.json(view_info.positions);
	  }
  	  res.render('positions',view_info);
  	});
  });
});

function on_insert_historical(historicals){
	console.log('receive event: historical, insert. ');
	if(historicals.length<1) return;
	var dates = new Set();
	var min = moment(moment(historicals[0].Date).format('YYYY-MM-DD'));
	for(var i=0; i< historicals.length; i++){
		var dt = moment(historicals[i].Date).format('YYYY-MM-DD');
		dates.add(dt);
		if(moment(dt).unix()<moment(min).unix()) min = dt;
	}
	database.models.portfolio.find().each(function(portfolio){
		database.models.order.count({Portfolio:portfolio.uid}).run(function(o_err,count){
			if(o_err) throw o_err;
			if(count>0) control.netvalue.insert_netvalue(database.models.netvalue,dates,portfolio.uid,function(flag){
				update_netvalue(portfolio.uid,dt);
			});
		});
	});
}
function update_netvalue(portfolio,dt){
	database.models.netvalue.find({Portfolio:portfolio, Time: orm.lt(dt)}).order('-Time').limit(1).run(function(err,last){
		if(err) throw err;
		if(last.length<1) return;
		var beg = last[0].Time;
		database.models.netvalue.find({Portfolio:portfolio, Time: orm.gte(beg)}).order('Time').run(function(err,netvalues){
			if(err) throw err;
			if(netvalues.length<1) return;
			database.models.position.find({Portfolio:portfolio},function(err,positions){
				if(err) throw err;
				if(positions.length<1) return;
				var pos_map = new Set();
				for(var i=0; i< positions.length; i++){
					pos_map.add(positions[i].Code,positions[i]);
				}
				netvalues.recalc_value(quotes_db,pos_map,control.position,netvalues);

			});
		});
	});
}

function on_update_current_quote(current_quotes){
	if(current_quotes.length<1) return;
	var dt = moment(current_quotes[0].Time).format('YYYY-MM-DD');
	database.models.portfolio.find().each(function(portfolio){
		database.models.order.count({Portfolio:portfolio.uid},function(o_err,count){
			if(o_err) throw o_err;
			if(count<1) return;
			var dates = new Set();
			dates.add(dt);
			control.netvalue.insert_netvalue(database.models.netvalue,dates,portfolio.uid,function(flag){
				//update position
				update_position();
			});
		});
	});
	console.log('receive event: current_quote, update. ');
}

function update_position()
{
	database.models.position.find().run(function(err,positions){
		if(err) throw err;
		control.position.calc_current(quotes_db,positions,function(){
		});
	});
}

function on_quotes_ready(db){
	console.log('receive event: quotes, ready. ');
	quotes_db = db;
}


function init(quotes){
	connect();
	quotes.control.historical.event.on('insert',on_insert_historical);
	quotes.control.current_quote.event.on('update',on_update_current_quote);
	quotes.event.on('ready',on_quotes_ready);
}

function bind(app){
	app.use(function(req, res, next) {
		req.models.portfolio=database.models.portfolio;
		req.models.order=database.models.order;
		req.models.position=database.models.position;
		req.models.netvalue=database.models.netvalue;
		next();
	});
}

module.exports = {
  models: database.models,
  init: init,
  bind: bind,
  router:router
};

