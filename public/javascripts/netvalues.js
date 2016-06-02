$(document).ready(function() {
    init_netvalue();
});
function init_order_modal(){
}
function init_netvalue(){
	g_netvalues.shift();
	display_netvalue();
}
/*
function figure_tabel_toggle(){
	var fig = $('#netvalue_figure');
	var table = $('#netvalue_chart');
	fig.toggle();
	table.toggle();
}

function draw_figure(){
	var paper = new Raphael(document.getElementById('netvalue_figure'),680,400);
	var x = [];
	var y = [];
	var opts = {smooth: false, colors: ['red', 'blue', 'green'], symbol: 'circle'};
	for(var i=0; i< g_netvalues.length;i++){
		x.push(g_netvalues[i].Date);
		y.push(g_netvalues[i].Value);
	}
	//fig.linechart();  
	var circle = paper.circle(100, 100, 80);

}
*/
function display_netvalue() {
    //draw_figure();
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
