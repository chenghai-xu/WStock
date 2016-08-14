$(document).ready(function() {
    init_position();
});

function init_position(){
    display_position();
    update_position_map();
    update_sell_options();
}

var positions_map = new Map(); 
var sell_options = [];
function update_sell_options(){
	sell_options=[];
	var positions = getPositions();
	for(var i=0; i<positions.length;i++){
		var code = positions[i].Code.toLowerCase();
		if(code==='cash'){
			continue;
		}
		var pos = stockInfos.find(function(element,index,array){
			return element.code === code;
		});
		sell_options.push(pos);

	}
}
function update_position_map(){
	positions_map.clear();
	for(var i = 0; i< g_positions.length; i++){
		positions_map.set(g_positions[i].Code,g_positions[i]);
	}
}

function display_position() {
    var rows = $("#positions_table .tableRow");
    var Positions = getPositions();
    for(var i=0; i<Positions.length - rows.length;i++){
    	newpositionRow();
    }
    rows = $("#positions_table .tableRow");
    for(var i=0; i<rows.length - Positions.length ;i++){
    	rows[i].remove();
    }
    setTimeout(function(){
        for(var i=0; i< Positions.length;i ++){
            updatepositionRow($(rows[i]),Positions[i],i);
        	}
    },0);

}

function newpositionRow() {
	var table = $("#positions_table");
	var row = $("#positions_table .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	row.show();	
	table.append(row);
   	return row;
}

function updatepositionRow(row,position,id) {
   	$("#p_id"          , row).text(id);
   	$("#p_code"        , row).text(position.Code          );
   	$("#p_name"        , row).text(position.Name          );
   	$("#p_volume"      , row).text(position.Volume        );
   	$("#p_price"       , row).text(position.Current_Price .toFixed(4));
   	$("#p_amount"      , row).text(position.Current_Amount.toFixed(4));
   	$("#p_price_cost"  , row).text(position.Cost_Price    .toFixed(4));
   	$("#p_amount_cost" , row).text(position.Cost_Amount   .toFixed(4));
   	$("#p_gain"        , row).text(position.Gain          .toFixed(4));
   	$("#p_gain_rate"   , row).text(position.Gain_Rate     .toFixed(4));
    if(position.Gain>0){
        $("#p_gain", row).parent().addClass("gain_up").removeClass("gain_down");
        $("#p_gain_rate", row).parent().addClass("gain_up").removeClass("gain_down");
    }
    else{
        $("#p_gain", row).parent().addClass("gain_down").removeClass("gain_up");
        $("#p_gain_rate", row).parent().addClass("gain_down").removeClass("gain_up");
    }
}

function getPositions(){
	return g_positions;
}

function addPositions(position){
	g_positions.push(position);
	return g_positions.length - 1;
}

function setPositions(position,id){
	g_positions[id]=position;
	return;
}

function isArray(obj) {   
	return Object.prototype.toString.call(obj) === '[object Array]';    
}   

function update_position(){
	$.ajax({
	    url    : '/portfolios/position?get=true&portfolio='+g_portfolio,
	    type   : 'get'
	}).done(function (data) {
	    if(isArray(data)){
                window.setTimeout(function(){
			g_positions = data;
			init_position();
		}, 0);
            }

	}).fail(function (xhr, err, status) {
	    alert(err);
	});
}

function get_position_volume(code){
	var pos = positions_map.get(code);
	if(pos){
		return pos.Volume;
	}
	return 0;
}
