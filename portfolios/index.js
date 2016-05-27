'use strict'
var router = require('express').Router();
var orm      = require('orm');
var moment = require('moment');
var debug = require('debug')('express:portfolios');

var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var msg2view = require('../views/msg2view');

var database = {models:{}};
var cash_code = 'CASH';
var cash_name = '现金';

function connect(){
  orm.connect(settings.portfolios, function (err, db) {
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
    });
  });
}

router.get('/',function(req, res) {
  control.portfolio.list(database.models.portfolio,{Owner:req.user.uid},function(info){
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
        Owner: req.user.uid,
        Name: req.body.Name};
    debug("create portfolio: ",params);
    control.portfolio.create(database.models.portfolio,params,function(info){
        return res.json(info);

    });
  }
  else if(req.query.action=='edit'){
    var params = {
        uid: req.body.uid,
        Owner: req.user.uid,
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
  is_owned_portfolio({uid:req.query.portfolio,Owner:req.user.uid},function(portfolio){
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
  view_info.msg = "No portfolio uid";
  debug("create or change order, user: %s, req.body: ",req.user.uid,req.body);
  if(req.body.Portfolio==null){
	res.json(view_info);
  }
  is_owned_portfolio({uid:req.body.Portfolio,Owner:req.user.uid},function(portfolio){
  	view_info.msg = "no or invalid portfolio uid";
	if(portfolio == null){
		return res.json(view_info);
	}
  	if(req.query.action=='new'){
  	  var params = {
    		Portfolio: req.body.Portfolio,
    		Time     : req.body.Time     ,
    		Code     : req.body.Code     ,
    		Name     : req.body.Name     ,
    		Type     : req.body.Type     ,
    		Price    : req.body.Price    ,
    		Volume   : req.body.Volume   ,
    		Fee      : req.body.Fee      }
  	  debug("create order: ",params);
  	  control.order.create(database.models.order,params,function(info){
  	      return res.json(info);

  	  });
  	}
  	else if(req.query.action=='edit' && req.body.orders.length>1){
  	  trade_orders(req,portfolio,function(good_orders,bad_orders){
  	  	debug("only save good orders. \n");
		var result = {};
		result.bad = bad_orders;
		if(good_orders.length<1){
			result.good = [];
			return res.json(result);
		}
		save_orders(good_orders,function(infos){
			result.good = infos;
			return res.json(result);
		});
	  });
  	}

  });
});

function save_orders(orders,cb){
	  var infos = [];
	  for(var i=0; i< orders.length;i++){
  	  	control.order.save(database.models.order,orders[i],function(info){
			infos.push(info);
			if(infos.length == orders.length){
				return cb(infos);
			}
			
  	  	});    
	  }
}

function order_sort(a,b){
	return moment(a.Time).unix() - moment(b.Time).unix();
}

function new_position(code,name) {
	return {
		Code             : code,
		Name             : name,
		Volume           : 0,
		Current_Price    : 0,
		Current_Amount   : 0,
		Cost_Price       : 0,
		Cost_Amount      : 0,
		Gain             : 0,
		Gain_Rate        : 0
	};
}
function new_trade_status()
{
	return {flag:false,msg:'',Codes:[]};
}
function do_trade_cash(pos_map,order){
	var t_stat=new_trade_status();
	t_stat.flag=false;
	var pos_cash = pos_map.get(order.Code);
	if(pos_cash==null)
	{
		pos_cash = new_position(order.Code,order.Name);
	}
	if(order.Type == 'SUBSCRIBE') {
		pos_cash.Current_Amount += order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		t_stat.flag=true;
		t_stat.msg='OK.';
		t_stat.Codes.push(order.Code);
	}
	else if(order.Type == 'REDEEM' && order.Amount < pos_cash.Current_Amount){
		pos_cash.Current_Amount -= order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		t_stat.flag=true;
		t_stat.msg='OK.';
		t_stat.Codes.push(order.Code);
    	}
	else{
		t_stat.flag=true;
		t_stat.msg='Invalide order type or insufficient cash.';
	}
	return t_stat;
}
function do_trade_asset(pos_map,order){
	var t_stat=new_trade_status();
	t_stat.flag=false;
	var pos_asset = pos_map.get(order.Code);
	var pos_cash = pos_map.get(cash_code);
	if(pos_asset==null)
	{
		pos_asset = new_position(order.Code,order.Name);
	}
	if(pos_cash==null)
	{
		pos_cash = new_position(cash_code,cash_name);
	}
	if(order.Type == 'BUY' && pos_cash.Current_Amount >= order.Amount) {
		pos_asset.Volume += order.Volume;
		pos_cash.Current_Amount -= order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		pos_map.set(pos_asset.Code,pos_asset);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(order.Code);
		t_stat.Codes.push(cash_code);
	}
	else if(order.Type == 'SELL' && pos_asset.Volume >= order.Volume){
		pos_asset.Volume -= order.Volume;
		pos_cash.Current_Amount += order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		pos_map.set(pos_asset.Code,pos_asset);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(order.Code);
		t_stat.Codes.push(cash_code);
    	}
	else if(order.Type == 'DELIVERY'){
		pos_asset.Volume += order.Volume;
		pos_map.set(pos_asset.Code,pos_asset);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(order.Code);
    	}
	else if(order.Type == 'DIVIDEN'){
		pos_cash.Current_Amount += order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(cash_code);
    	}
	else{
		t_stat.flag=false;
		t_stat.msg='Insufficient cash or asset volume.';
	}
	return t_stat;
}


function complete_order(order){
    	if(order.Type == 'SELL' || order.Type == 'DIVIDEN'){
    	    order.Amount = parseFloat(order.Price * order.Volume - order.Fee);
    	}
    	else if(order.Type == 'BUY'){
    	    order.Amount = parseFloat(order.Price * order.Volume + order.Fee);
    	}
    	order.Code = order.Code.toUpperCase();
	if(order.Code == cash_code){
		order.Amount = order.Volume;
		order.Name = cash_name;
	}
}
function do_trade_each(pos_map,order){
        if(order.Amount<=0){
		var stat = new_trade_status();
		stat.flag=false;
		stat.msg='Order amount < 0.';
		return stat;
	}

	if(order.Code == cash_code){
		return do_trade_cash(pos_map,order);
	}
	return do_trade_asset(pos_map,order);
}

function trade_orders(req,portfolio,cb){
  	control.position.list(database.models.position,{Portfolio:req.query.portfolio},function(position_info){
  	  if(!position_info.flag){
  	      	debug("list position error.");
		return cb([],["list position error."]);
  	  }
	  var sorted_orders = req.body.orders.sort(order_sort);
	  var order_good = [];
	  var order_bad = [];
	  var pos_map = new Map();
	  var pos_set = new Set();
	  for(var i=0;i<position_info.positions.length;i++){
	  	pos_map.set(position_info.positions[i].Code,position_info.positions[i]);
	  }
	  var j=0;
	  for(var i=0; i<sorted_orders.length;i++)
	  {
		complete_order(sorted_orders[i]);
		var dt_p = moment(portfolio.Order_Time);
		var dt_o = moment(sorted_orders[i].Time);
		if(dt_p.isAfter(dt_o)){
			j=i;
			break;
		}
	  	debug('before trade order, position: ',pos_map,'\norder: ', sorted_orders[i], '\n');
	  	var result=do_trade_each(pos_map,sorted_orders[i]);
	  	debug('after trade order, position: ',pos_map,'\nresult: ',result,'\n');
	  	if(!result.flag){
			j=i;
	  		break;
		}
		portfolio.Order_Time = sorted_orders[i].Time;
	  	debug('update portfolio time: ',portfolio,'\n');
		for(let code of result.Codes){
                	pos_set.add(code);
		}
		order_good.push(sorted_orders[i]);
	  }
	  for(var i=j;i<sorted_orders.length;i++) {
		  order_bad.push(sorted_orders[i]);
	  }

	  var pos_new = [];
	  for(let code of pos_set){
		  pos_new.push(pos_map.get(code));
	  }
	  debug('positions changed, portfolio, %s, positions: ',portfolio,pos_new);
	  debug('good orders: ',order_good,'\n');
	  debug('bad orders: ',order_bad,'\n');

	  return cb(order_good,order_bad);
  	  });
}

router.get('/position',function(req, res) {
  if(req.query.portfolio==null){
	res.redirect('/');
  }
  debug("list position, user: %s, portfolio: %",req.user.uid,req.query.portfolio);
  is_owned_portfolio({uid:req.query.portfolio,Owner:req.user.uid},function(flag){
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
  	  view_info.positions = position_info.positions;
  	  res.render('positions',view_info);
  	});
  });
});



module.exports = {
  models: database.models,
  init: connect,
  router:router
};

