'use strict'
var orm      = require('orm');
var moment = require('moment');
var debug = require('debug')('express:portfolios');
var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter();

module.exports = {
	list   : list,
	create : create,
	get    : get,
	save   : save,
	new_order: new_order,
	insert_netvalue:insert_netvalue,
	recalc_value: recalc_value,
	event: event
}

function new_order(req,pos_map,pos_control,order){
	var order_date = moment(order.Time).format('YYYY-MM-DD');
	req.models.netvalue.find({Portfolio:order.Portfolio,Time: orm.lt(order_date)}).order('-Time').limit(1).run(function(err,previous){
		if(err) throw err;
		if(previous.length<1) {
			insert_from_order(req,order,function(prev_date){
				netvalue_ready(req,pos_map,pos_control,order,prev_date);
			});
		}
		else{
			netvalue_ready(req,pos_map,pos_control,order,previous[0].Time);
		}
	});
}

function netvalue_ready(req,pos_map,pos_control,order,prev_date){
	req.models.netvalue.find({Portfolio:order.Portfolio,Time: orm.gte(prev_date)}).order('Time').run(function(err,netvalues){
		if(err) throw err;
		console.log(prev_date);
		if(netvalues.length<2) throw 'net value day length must be large than 2';

		var order_date = moment(order.Time).format('YYYY-MM-DD');
		debug('current netvalue, time: %s, share: %s', netvalues[1].Time, netvalues[1].Share);
		if(netvalues[1].Share==0) netvalues[1].Share = netvalues[0].Share;
		if(order.Type == 'SUBSCRIBE'){
			netvalues[1].Share += parseFloat(order.Amount / netvalues[0].Value);
		}
		else if(order.Type == 'REDEEM'){
			netvalues[1].Share -= parseFloat(order.Amount / netvalues[0].Value);
		}
		debug('current netvalue, time: %s, share: %s', netvalues[1].Time, netvalues[1].Share);

		if(netvalues.length>2){
			for(var i=2; i<netvalues.length; i++) netvalues[i].Share = netvalues[i-1].Share;
		}

		netvalues.shift();
		var quotes_db = req;
		recalc_value(quotes_db,pos_map,pos_control,netvalues);
	});
}

function recalc_value(quotes_db,pos_map,pos_control,netvalues){
	var assets = new Map();
	for(var i=0; i< netvalues.length; i++){
		pos_control.calc_asset(quotes_db,pos_map,netvalues[i].Time,function(dt,total){
			assets.set(dt,total);
			if(assets.size == netvalues.length){
				do_calc_value(assets,netvalues);
			}
		});
	}
}

function do_calc_value(assets,netvalues){
	for(var i=0; i< netvalues.length; i++){
		netvalues[i].Total = assets.get(netvalues[i].Time);
		netvalues[i].Value = parseFloat(netvalues[i].Total/netvalues[i].Share);
		netvalues[i].save(function(err){
			if(err) throw err;
		});
	}
}

function insert_from_order(req,order,cb){
	var order_date = moment(order.Time).format('YYYY-MM-DD');
	req.models.historical.find({Code: 'SH000001',Date: orm.lt(order_date)}).order('-Date').limit(1).run(function(err, last){
		if(err) throw err;
		if(last.length<1) throw 'Can not find last market day before ' + order_date;
		var begin_date = moment(last[0].Date).format('YYYY-MM-DD');
		req.models.historical.find({Code: 'SH000001',Date: orm.gte(begin_date)}).order('Date').run(function(err,items){
			if(err) throw err;
			var dates = new Set();
			var idx = null;
			for(var i=0; i < items.length; i++){
				dates.add(moment(items[i].Date).format('YYYY-MM-DD'));
			}
			req.models.current_quote.find({Code: 'SH000001'}).run(function(err,quotes){
				if(err) throw err;
				if(quotes.length>0) dates.add(moment(quotes[0].Time).format('YYYY-MM-DD'));
				insert_netvalue(req.models.netvalue,dates,order.Portfolio,function(flag){
					cb(begin_date);
				});
			});
		});
	});
}

function insert_netvalue(nv_model,dates,portfolio,cb){
	if(dates.size<1){
		return cb(false);
	}
	var arr = Array.from(dates);
	var min = arr[0];
	for(var i=0; i< arr.length; i++){
		if(moment(arr[i]).unix()<moment(min).unix()) {
			min = arr[i];
		}
	}
	debug('try to insert netvalue day, portfolio: %s, date: ', portfolio,dates);
	nv_model.find({Portfolio:portfolio, Time: orm.gte(min)},function(err,items){
		if(err) throw err;
		for(var i=0; i< items.length;i++){
			debug('try to delete exist netvalue day, date: %s', items[i].Time);
			dates.delete(items[i].Time);
		}
		if(dates.size<1) return cb(false);
		var try_netvalue = [];
		for(let date of dates){
			try_netvalue.push({
				Portfolio: portfolio,
				Time: date,
				Share: 0,
				Value: 1
			});
		}
		nv_model.create(try_netvalue,function(c_err, c_items){
			if(err) throw err;
			console.log('insert netvalue success.');
			return cb(true);
		});

	});
}

function create(items_TB, params, callback) {
    var info ={flag:false,msg:''};
        items_TB.create(params, function (err, items) {
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;info.msg='新建netvalue成功。';
            info.netvalues = new Array();
            info.netvalues[0] = items.serialize();
            return callback(info);
        });
}
function list(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.netvalues=new Array();
            for(var i=0; i<items.length;i++){
                info.netvalues[i]=items[i].serialize();
            }
            return callback(info);
        });
}
function get(items_TB, params, callback) {
    items_TB.find({uid: params.uid,Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err || items.length<1) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;
            info.netvalues=new Array();
            info.netvalues[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    items_TB.find({uid: params.uid,Portfolio: params.Portfolio}).
        run(function (err, items) {
            var info ={flag:false,msg:''};
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            if(items.length<1){
                info.flag=false;info.msg='不存在此项目。';
                return callback(info);    
            }
	    items[0].Value           = params.Value           ;
	    items[0].save(function(err){
                if(err){
                    info.flag=false;
                    info.msg=err;
                }
                else{
                    info.flag=true;
                    info.msg='保存成功';
                }
                return callback(info);

            });

        });
}



