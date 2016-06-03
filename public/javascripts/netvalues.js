$(document).ready(function() {
    init_netvalue();
});
function init_netvalue(){
	g_netvalues.shift();
	display_netvalue();
}
function figure_tabel_toggle(btn){
	var fig = $('#netvalue_figure');
	var table = $('#netvalue_table');
	fig.toggle();
	table.toggle();
}

function draw_figure(){
	//Get context with jQuery - using jQuery's .get() method.
	var ctx = $("#netvalue_chart").get(0).getContext("2d");

	var opts = {};
	var x_value = [];
	var y_value = [];
	for(var i=0; i< g_netvalues.length;i++){
		x_value.push(g_netvalues[i].Date);
		y_value.push(g_netvalues[i].Value);
	}

	var dataset = {};
	dataset.label = 'Net Value';
	dataset.data = y_value;
	dataset.backgroundColor = "rgba(75,192,192,0.4)";

	var data = {};
	data.labels = x_value;
	data.datasets=[];
	data.datasets.push(dataset);
	
	var params = {};
	params.type='line';
	params.data=data;
	params.options = opts;
	var chart = new Chart(ctx,params);

}
function display_netvalue() {
    draw_figure();
    var rows = $("#netvalues_table .tableRow");
    var netvalues = get_netvalues();
    for(var i=0; i<netvalues.length - rows.length;i++){
    	new_netvalue_row();
    }
    rows = $("#netvalues_table .tableRow");
    for(var i=0; i<rows.length - netvalues.length ;i++){
    	rows[i].remove();
    }
    setTimeout(function(){
        for(var i=0; i< netvalues.length;i ++){
            update_netvalue_row($(rows[i]),netvalues[i],i);
        	}
    },0);

}

function new_netvalue_row() {
	var table = $("#netvalues_table");
	var row = $("#netvalues_table .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	row.show();	
	table.append(row);
   	return row;
}

function update_netvalue_row(row,netvalue,id) {
   	$("#n_id"          , row).text(id);
   	$("#n_date"        , row).text(netvalue.Date          );
   	$("#n_share"        , row).text(netvalue.Share.toFixed(2));
   	$("#n_value"      , row).text(netvalue.Value.toFixed(2));
   	$("#n_total"       , row).text(netvalue.Total.toFixed(2));
}

function get_netvalues(){
	return g_netvalues;
}
function add_netvalues(netvalue){
	g_netvalues.push(netvalue);
	return g_netvalues.length - 1;
}
function set_netvalues(netvalue,id){
	g_netvalues[id]=netvalue;
	return;
}
