$(document).ready(function() {
    init_order_modal();
});

function init_order_modal(){
    $('#form-new-order').submit(new_order);
    $('#new-order-modal').on('show.bs.modal',function(){
	    var input = $('#form-new-order #order-time');
	    init_datetime(input);
    });
}

function new_order(){
	if(!get_position_volume || !update_position){
		alert('the function of position volume or update position is missing.');
	}
	var form = $("#new-order-modal #form-new-order");
	var time   = $("#order-time"   , form).val();
	var code   = $("#order-code"   , form).val();
	var name   = $("#order-name"   , form).val();
	var type   = $("#order-type"   , form).val();
	var price  = $("#order-price"  , form).val();
	var volume = $("#order-volume" , form).val();
	var fee    = $("#order-fee"    , form).val();
	var amount = $("#order-amount" , form).val();
	var order = {
            uid              : null   ,
            Portfolio        : g_portfolio,
            Time             : time   ,
            Code             : code   ,
            Name             : name   ,
            Type             : type   ,
            Price            : price  ,
            Volume           : volume ,
            Fee              : fee    ,
            Amount           : amount ,
            Flag             : 1      
	};
        var content = {
                Portfolio: g_portfolio,
                orders: [order]
        };
	$.ajax({
	    url    : '/portfolios/order?action=new',
	    type   : 'post',
	    data   : JSON.stringify(content),
	    contentType: 'application/JSON'

	}).done(function (data) {
            alert(JSON.stringify(data));
	    if(data.flag){
                window.setTimeout(function(){
			$('#new-order-modal').modal('hide');
			update_position();
		}, 0);
            }

	}).fail(function (xhr, err, status) {
	    alert(err);
	});
}

function order_direction_changed(it){
	$("#form-new-order #order-type").val(it);
}

function number_pad(s){
	var d=s.toString();
	if(d<10){
		d='0'+d;
	}
	return d;
}
function init_datetime(input){
	if(input.val()!='') return;
	var dt = new Date();
	var M = dt.getMonth()+1;
	var d = dt.getDate();
	var h = dt.getHours();
	var m = dt.getMinutes();
	var str = dt.getFullYear()+'-'+
		number_pad(M) + '-'+
		number_pad(d) + 'T' +
		number_pad(h) + ':' +
		number_pad(m);
	input.val(str);
}

function enter_code_input(it) {
	var type = $("#form-new-order #order-type").val();
	var code = $(it);
	var name = $('#form-new-order #order-name');
	if(type == 'SELL'){
		setAutoComplete(sell_options,code,name);
	}
	else if(type == 'SUBSCRIBE' || type == 'REDEEM'){
		code.val('CASH');
		name.val('现金');
		//code.blur();
	}
	else{
		options = stockInfos;
		setAutoComplete(stockInfos,code,name);
	}


}
function setAutoComplete(options, code, name) {
	// http://suggest3.sinajs.cn/suggest/type=&key=flzc&name=gpdm
	code.autocomplete(options, {
			max: 5,
			minChars: 1,
			matchSubset: true,
			matchContains: true,
			autoFill: false,
			highlight: false,
			width: "118px",
			formatItem: function(item, i, max) { 
				return item.name + '┊' + item.code; 
			}, 
			formatMatch: function(item, i, max) { 
				return item.pyname + item.name + item.code;
			}, 
			formatResult: function(item) { 
				return item.name; 
			} 
		}).result(function(event, item, formatted) { 
			name.val(item.name);
			code.val(item.code.toUpperCase());
		}
	); 
}
function init_volume_input(it) {
	var type = $("#form-new-order #order-type").val();
	var code = $("#form-new-order #order-code").val();
	var tip  = $("#form-new-order #order-volume-tip");
	var volume  = $("#form-new-order #order-volume");
	var cash = get_position_volume('CASH');
	var max  = get_position_volume(code);
	if(type == 'SELL'){
		volume.attr('max', max);
                tip.text('可用量: '+max);
	}
	else if(type == 'REDEEM'){
		volume.attr('max', cash);
                tip.text('可用额: '+max);
	}
	else if(type == 'BUY'){
		var price = $("#form-new-order #order-price").val();
		max = parseInt(cash/price);
		volume.attr('max', max);
                tip.text('可买量: '+max);
	}
	else{
		volume.removeAttr('max');
                tip.text('');
		flag = false;
	}
}
function exit_volume_input(it) {
	var type = $("#form-new-order #order-type").val();
	var code = $("#form-new-order #order-code").val();
	var cash = get_position_volume('CASH');
	var max  = get_position_volume(code);
	var volume = $(it);
	var curr = parseFloat(volume.val()); 
	if(type == 'SELL'){
		if(curr>max){
			volume.val(max);
		}
	}
	else if(type == 'REDEEM'){
		if(curr>max){
			volume.val(max);
		}
	}
	else if(type == 'BUY'){
		var price = parseFloat($("#form-new-order #order-price").val());
		max = cash/price;
		if(curr>max){
			volume.val(max);
		}
	}
}
function enter_price_input(it) {
	var code = $("#form-new-order #order-code").val();
	var type = $("#form-new-order #order-type").val();
	var price = $(it);
	if(code == 'CASH' || type == 'DELIVERY' || 
		type == 'SUBSCRIBE' ||
		type == 'REDEEM' ){
		price.val(1);
		//price.blur();
	}
}
function enter_amount_input(it) {
	var price =  $("#form-new-order #order-price").val();
	var volume = $("#form-new-order #order-volume").val();
	var fee =    $("#form-new-order #order-fee").val();
	var type =    $("#form-new-order #order-type").val();
	price = parseFloat(price);
	volume = parseFloat(volume);
	fee = parseFloat(fee);
	var amount = $(it);
	var am = 0;
	if(type == 'BUY'){
		am = parseFloat(price*volume+fee);
	}
	else if(type == 'SELL'){
		am = parseFloat(price*volume-fee);
	}
	else if(type == 'SUBSCRIBE'){
		am = parseFloat(volume-fee);
	}
	else if(type == 'REDEEM'){
		am = parseFloat(volume+fee);
	}
	else if(type == 'DELIVERY'){
		am = volume;
	}
	else if(type == 'DIVIDEN'){
		am = parseFloat(price*volume-fee);
	}
	else{
		am = volume;
	}
	amount.val(am);
	//amount.blur();
}
