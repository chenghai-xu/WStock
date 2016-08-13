'use strict'
var moment = require('moment');
var orm = require('orm');
var debug = require('debug')('express:portfolios');
var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter();
var cash_code = 'CASH';
var cash_name = '现金';


module.exports = {
list   : list,
create : create,
get    : get,
save   : save,
calc_asset: calc_asset,
calc_current : calc_current,
on_insert_portfolio: on_insert_portfolio,
new_position: new_position,
create_or_save_position : create_or_save_position,
trade_status : trade_status,
do_trade_each : do_trade_each,
event 	:event
}
function calc_asset(quotes_db,pos_map,dt,cb){
	//console.log("position.calc_asset");
	//console.log("date: %s",dt);
	var total = Number(0);
	var count = 0;
	for(let pos of pos_map.values()){
		calc_each(quotes_db,pos,dt,function(t){
			total += t;
			count ++;
			//console.log("position size %s, count %s",pos_map.size,count);
			if(count == pos_map.size){
				//console.log("return now");
				cb(dt,total);
			}
		});
	}
}
function calc_each(quotes_db,pos, dt,cb){
	var code = pos.Code;
	//console.log("position.calc_each");
	console.log("code: %s, date %s",code,dt);
	if(code === 'CASH') return cb(pos.Volume);
	quotes_db.models.historical.find({Code:code,Date: orm.lte(dt)}).order('-Date').limit(1).run(function(err,historicals){
		console.log("find historical. code: %s, date",code,dt);
		if(err) throw err;
		if(historicals.length>0){
			return cb( parseFloat(pos.Volume * historicals[0].Close) );
		}
		quotes_db.models.current_quote.find({Code:code}).run(function(err,quotes){
			if(err) throw err;
			if(quotes.length<1) {
				console.log('calculate postion asset, code: %s, date: %s, use cost amount',code, dt);
				return cb(parseFloat(pos.Cost_Amount));
			};
			return cb(parseFloat(pos.Volume * quotes[0].Current));

		});
	});
}
function calc_current(quotes_db,positions,cb){
	for(var i=0; i< positions.length; i++){
		calc_current_each(quotes_db,positions[i],function(){
			if(i==positions.length){
				cb();
			}
		});
	}
}

function calc_current_each(quotes_db,pos,cb){
	var code = pos.Code;
	quotes_db.models.current_quote.find({Code:code}).run(function(err,quotes){
		if(err) throw err;
		if(quotes.length<1) {
			console.log('calculate current postion asset, code: %s, use cost amount',code);
			pos.Current_Price = pos.Cost_Price;
			pos.Current_Amount = parseFloat(pos.Current_Price * pos.Volume);
			return cb();
		};
		pos.Current_Price = quotes[0].Current;
		pos.Current_Amount = parseFloat(pos.Current_Price * pos.Volume);
		pos.save(function(err){
			if(err) return err;
		});
		return cb();

	});
}

function create(items_TB, params, callback) {
    var info ={flag:false,msg:''};
        items_TB.create(params, function (err, items) {
            if(err) {
                info.flag=false;info.msg=err;
                return callback(info); 
            }
            info.flag=true;info.msg='新建position成功。';
            info.positions = new Array();
            info.positions[0] = items.serialize();
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
            info.positions=new Array();
            for(var i=0; i<items.length;i++){
                info.positions[i]=items[i].serialize();
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
            info.positions=new Array();
            info.positions[0]=items[0].serialize();
            return callback(info);
        });
}

function save(items_TB, params, callback) {
    items_TB.find({Portfolio: params.Portfolio, Code: params.Code}).
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
	    items[0].Volume          = params.Volume          ;
	    items[0].Current_Price   = params.Current_Price   ;
	    items[0].Current_Amount  = params.Current_Amount  ;
	    items[0].Cost_Price      = params.Cost_Price      ;
	    items[0].Cost_Amount     = params.Cost_Amount     ;
	    items[0].Gain            = params.Gain            ;
	    items[0].Gain_Rate       = params.Gain_Rate       ;
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

function on_insert_portfolio(db,portfolio){
	var pos_cash = new_position('CASH','现金');
	pos_cash.Portfolio = portfolio.uid;
	pos_cash.Current_Price = 1;
	pos_cash.Cost_Price = 1;
	db.models.position.create(pos_cash,function(err,items){
		if(err) throw err;
	});
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

function trade_status()
{
	return {flag:false,msg:'',Codes:[]};
}
function do_trade_cash(pos_map,order){
	console.log("position.do_trade_cash");
	var t_stat=trade_status();
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
		//console.log("SUBSCRIBE");
		
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
		//console.log("REDEEM");
    	}
	else{
		t_stat.flag=true;
		t_stat.msg='Invalide order type or insufficient cash.';
		//console.log("FALSE");
	}
	return t_stat;
}

function do_trade_asset(pos_map,order){
	console.log("position.do_trade_asset");
	var t_stat=trade_status();
	t_stat.flag=false;
	var pos_asset = pos_map.get(order.Code);
	var pos_cash = pos_map.get(cash_code);
	if(pos_asset==null)
	{
		pos_asset = new_position(order.Code,order.Name);
	}
	if(pos_cash==null)
	{
		pos_cash = control.new_position(cash_code,cash_name);
	}
	if(order.Type == 'BUY' && pos_cash.Current_Amount >= order.Amount) {
		pos_asset.Volume += order.Volume;
		pos_asset.Cost_Amount += order.Amount;
		pos_asset.Cost_Price = pos_asset.Cost_Amount/pos_asset.Volume;
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
		//console.log("BUY");
	}
	else if(order.Type == 'SELL' && pos_asset.Volume >= order.Volume){
		pos_asset.Volume -= order.Volume;
		pos_asset.Cost_Amount -= order.Amount;
		pos_asset.Cost_Price = pos_asset.Cost_Amount/pos_asset.Volume;
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
		//console.log("SELL");
    	}
	else if(order.Type == 'DELIVERY'){
		pos_asset.Volume += order.Volume;
		pos_asset.Cost_Price = pos_asset.Cost_Amount/pos_asset.Volume;
		pos_map.set(pos_asset.Code,pos_asset);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(order.Code);
		//console.log("DELIVERY");
    	}
	else if(order.Type == 'DIVIDEN'){
		pos_asset.Cost_Amount -= order.Amount;
		pos_asset.Cost_Price = pos_asset.Cost_Amount/pos_asset.Volume;
		pos_cash.Current_Amount += order.Amount;
		pos_cash.Volume = pos_cash.Current_Amount;
		pos_cash.Cost_Amount = pos_cash.Current_Amount;
		pos_cash.Current_Price = pos_cash.Cost_Price=1;
		pos_map.set(cash_code,pos_cash);
		t_stat.msg='OK.';
		t_stat.flag=true;
		t_stat.Codes.push(cash_code);
		//console.log("DIVIDEN");
    	}
	else{
		t_stat.flag=false;
		t_stat.msg='Insufficient cash or asset volume.';
		//console.log("FALSE");
	}
	return t_stat;
}


function do_trade_each(pos_map,order){
	var stat = null;
	console.log("position.do_trade_each");
	//console.log("position: ",pos_map);
	//console.log(order.Time,order.Code,order.Type,order.Volume,order.Amount);
        if(order.Amount<=0){
		stat = trade_status();
		stat.flag=false;
		stat.msg='Order amount < 0.';
		return stat;
	}

	if(order.Code == cash_code){
		stat = do_trade_cash(pos_map,order);
	}
	else{ 
		stat = do_trade_asset(pos_map,order);
	}
	//console.log("position: ",pos_map);
	return stat;
}

function create_or_save_position(req,portfolio,pos_map) {
	for(let pos of pos_map.values()){
	    console.log('save position: ',pos.Code,', volume',pos.Volume);
	    if(pos.Volume<=0 && pos.Code != cash_code){
		    if(pos.save){
			    pos.remove(function(error){
				    console.log('delete position, error: ',error);
			    });
			    req.models.current_quote.find({Code:pos.Code},function(err,items){
				    if(err) throw err;
				    if(items.length<1) return;
				    items[0].remove(function(err){
					    if(err) throw err;
				    });
			    });
		    }
	    }
	    else if(pos.save){
		    pos.save(function(err){
			    if(err) throw err;
		    });
	    }
	    else{
		    pos.Portfolio = portfolio.uid;
		    req.models.position.create(pos,function(err,items){
			    if(err)  throw err;
		    });
		    if(pos.Code === cash_code) return;
		    req.models.current_quote.count({Code:pos.Code},function(err,count){
			    if(err) throw err;
			    if(count>0) return;
			    req.models.current_quote.create({Code:pos.Code,Name:pos.Name},function(err,items){
				    if(err) throw err;
			    });
		    });
	    }
	}
}
