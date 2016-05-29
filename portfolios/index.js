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
	    if(info.flag){
	    	var pos_cash = new_position(cash_code,cash_name);
	    	pos_cash.Portfolio = info.portfolios[0].uid;
	    	database.models.position.create(pos_cash,function(err,items){
	    	        console.log('create position cash error: ',err);
	    	});
	    }
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
  view_info.msg = "invalid portfolio value";
  debug("create order, user: ",req.user.uid, ', portfolio: ', req.body.Portfolio);
  if(req.body.Portfolio==null){
  	debug(view_info.msg);
	res.json(view_info);
  }
  is_owned_portfolio({uid:req.body.Portfolio,Owner:req.user.uid},function(portfolio){
  	view_info.msg = "invalid portfolio or user";
	if(portfolio == null){
  		debug(view_info.msg);
		return res.json(view_info);
	}
	debug("pass portfolio validation");

	view_info.msg = "invalid query parameters";
  	if(req.query.action!='new'){
  		debug(view_info.msg);
		return res.json(view_info);
  	}
  	debug("to create orders, trade them first.");

  	trade_orders(req,portfolio,function(pos_new,good_orders,bad_orders){
  	      debug("only save traded orders:");
	      create_or_save_position(pos_new,portfolio);
	      var result = {};
	      result.bad = bad_orders;
	      if(good_orders.length<1){
	      	result.good = [];
	      	return res.json(result);
	      }
	      database.models.order.create(good_orders, function (err, items) {
		var info = {};
              	if(err) {
              	    info.flag=false;info.msg=err.msg;
              	    return res.json(info); 
              	}
              	info.flag=true;info.msg='新建order成功。';
              	info.orders = new Array();
              	info.orders[0] = items[0].serialize();
              	return res.json(info);
              });
	      /*
	      save_orders(good_orders,function(infos){
	      	result.good = infos;
	      	return res.json(result);
	      });
	      */
	});

  });
});

function save_orders(orders,cb){
	  var infos = [];
	  for(var i=0; i< orders.length;i++){
  	  	debug("save order, time: ",orders[i].Time,
			', code', orders[i].Code,
			', volume', orders[i].Volume,
			', amount', orders[i].Amount);
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
		Portfolio        : null,
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
	order.Time   =moment(order.Time).toISOString();
	order.Price  =parseFloat(order.Price );         
	order.Volume =parseFloat(order.Volume);         
	order.Fee    =parseFloat(order.Fee   );         
	order.Amount =parseFloat(order.Amount);         
	order.Flag   =parseInt(order.Flag  );         
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
  	control.position.list(database.models.position,{Portfolio:portfolio.uid},function(position_info){
  	  if(!position_info.flag){
  	      	debug("list position error.");
		return cb([],[],req.body.orders);
  	  }
	  //debug('position info: ',position_info);
	  var sorted_orders = req.body.orders.sort(order_sort);
	  for(var i=0; i<sorted_orders.length;i++)
	  {
		complete_order(sorted_orders[i]);
	  }
	  var order_good = [];
	  var order_bad = [];
	  var pos_map = new Map();
	  var pos_set = new Set();
	  var old_time = portfolio.Order_Time;
	  debug('current portfolio time: ',portfolio.Order_Time);
	  debug('current position: Code, Volume');
	  for(var i=0;i<position_info.positions.length;i++){
	  	pos_map.set(position_info.positions[i].Code,position_info.positions[i]);
	        debug(position_info.positions[i].Code,', ',position_info.positions[i].Volume);
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
			result = new_trade_status();
			result.flag=false;
			result.msg='Order time is before portfolio time.';
		}
		else{
	  	    result=do_trade_each(pos_map,sorted_orders[i]);
		}
	  	console.log('trade order result: ',result);
	  	if(!result.flag){
			j=i;
	  		break;
		}
		portfolio.Order_Time = sorted_orders[i].Time;
	  	debug('update portfolio order time: ',portfolio.Order_Time);
		for(let code of result.Codes){
                	pos_set.add(code);
	  		debug('position changed, code: ',pos_map.get(code).Code,
				', volume: ',pos_map.get(code).Volume);
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
	  if(old_time != portfolio.Order_Time){
    	      database.models.portfolio.find({uid:portfolio.uid,Owner:portfolio.Owner}).run(function(error,items){
	            
                if(!error && items.length>0) {
	            items[0].Order_Time=portfolio.Order_Time;
                	items[0].save(function(err){
	            	console.log('save portfolio order time error: ',err);
	            });
	        }
    	      });    
	  }
	  return cb(pos_new, order_good, order_bad);
	  /*
	  for(var i=0;i<pos_new.length;i++){
	      debug('save position: ',pos_new[i].Code,', volume',pos_new[i].Volume);
	      if(pos_new[i].Portfolio==null){
		  pos_new[i].Portfolio = portfolio.uid;
		  database.models.position.create(pos_new[i],function(error){
			    console.log('create position error: ',error);
			});
	      }
	      else if(pos_new[i].Volume<=0 && pos_new[i].Code!= cash_code){
		  database.models.position.find({Portfolio:portfolio.uid,Code:pos_new[i].Code}).
			remove(function(error){
			    console.log('delete position, error: ',error);
			});
	      }
	      else{
    	      	  control.position.save(database.models.position,pos_new[i],function(info){
	      	      console.log('save position, error: ',info);
    	      	  });    
	      }
	  }
	  */
  	  });
}
function create_or_save_position(pos_new,portfolio) {
	for(var i=0;i<pos_new.length;i++){
	    debug('save position: ',pos_new[i].Code,', volume',pos_new[i].Volume);
	    if(pos_new[i].Portfolio==null){
	        pos_new[i].Portfolio = portfolio.uid;
	        database.models.position.create(pos_new[i],function(error){
	      	    console.log('create position error: ',error);
	      	});
	    }
	    else if(pos_new[i].Volume<=0 && pos_new[i].Code!= cash_code){
	        database.models.position.find({Portfolio:portfolio.uid,Code:pos_new[i].Code}).
	      	remove(function(error){
	      	    console.log('delete position, error: ',error);
	      	});
	    }
	    else{
    	    	  control.position.save(database.models.position,pos_new[i],function(info){
	    	      console.log('save position, error: ',info);
    	    	  });    
	    }
	}
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
	  debug('list position: code, volume');
	  for(var i=0; i< position_info.positions.length;i++){
	  	debug(position_info.positions[i].Code, position_info.positions[i].Volume);
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

