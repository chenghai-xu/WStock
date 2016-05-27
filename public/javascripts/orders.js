$(document).ready(function() {
   init(); 
});

var edit_set = new Set();
function saveOrder()
{	
	if(edit_set.size<1){
		return;
	}
	var orders = [];
	var g_orders = getOrders();
	for(let id of edit_set)
	{
		orders.push(g_orders[id]);
	}
	var s_data = {};
	s_data.orders = orders;
	s_data.Portfolio = g_portfolio;
	console.log("change orders: ",s_data);
	$.ajax({
	    url    : '/portfolios/order?action=edit',
	    type   : 'post',
	    data   : JSON.stringify(s_data),
	    contentType: 'application/JSON'

	}).done(function (data) {
	    console.log("response: ",data);
	    alert(JSON.stringify(data));
	    $("#btnSaveOrder").prop("disabled",true);

	}).fail(function (xhr, err, status) {
	    alert(data);
	});
}

function init() {
	$('#btnNewOrder').click(function(){createOrder();});
	$("#btnSaveOrder").click(function() { saveOrder(); });
	$("#orders_table").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#orders_table").delegate("#order_dir", "click", function(){ selectOrderDir(); });
	$("#btnSaveOrder").prop("disabled",true);
    updateOrders();
}

function enterFieldEditMode(cell) {
	if(cell.tagName!="TD")
		return;
	var input = $("input", cell);
	var span = $("span", cell);

	if (input.is(":visible") || input.html() == null)
		return;
					
	var str = span.text();
	if(span.prop("id")=="o_time"){
		str=str.substring(0,str.length-5);
	}
	input.val(str);
	input.toggle();
	span.toggle();
	input.focus();
	if (input.prop("id") == "stockCode")
		setAutoComplete(input, span.parent().parent().parent());
}

function exitFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);
	var newValue = input.val();
	
	input.toggle();
	span.toggle();
	if(newValue==span.text()){
		return;
	}
	if(newValue==""){
		return;
	}
	span.text(newValue);
	var row = span.parent().parent().parent();
	var id = parseInt($("#o_id", row).text());
	if(id<0){
		return;
	}
	edit_set.add(id);
	var orders = getOrders();
	if(orders.length<1){
		return;
	}
	var order = orders[id];

    	order.Time     =$("#o_time"      , row).text();
    	order.Code     =$("#o_code"      , row).text();
    	order.Name     =$("#o_name"      , row).text();
    	order.Type     =$("#o_type"      , row).text();
    	order.Price    =parseFloat($("#o_price"     , row).text());
    	order.Volume   =parseFloat($("#o_volume"    , row).text());
    	order.Fee      =parseFloat($("#o_fee"       , row).text());
	setOrders(order,id);
	$("#btnSaveOrder").prop("disabled",false);
}

function updateOrders() {
    var btn = $("#btnLoadOrder"); 
    btn.prop("disabled", true);
    var rows = $("#orders_table .tableRow");
    var orders = getOrders();
    for(var i=0; i<orders.length - rows.length;i++){
    	newOrderRow();
    }
    rows = $("#orders_table .tableRow");
    setTimeout(function(){
        for(var i=0; i< orders.length;i ++){
            updateOrderRow($(rows[i]),orders[i],i);
        	}
        btn.prop("disabled", false);
    },0);

}

function createOrder() {
	//var row = newOrderRow();
	var order = {};
	order.uid = null;
    	order.Portfolio= g_portfolio; 
    	order.Time     = "2016-05-26 14:00:00";
    	order.Code     = "SZ000983";
    	order.Name     = "西山煤电";
    	order.Type     = "BUY";
    	order.Price    = 7.0;
    	order.Volume   = 1000; 
    	order.Fee      = 10;
	console.log("create order: ",order);
	$.ajax({
	    url    : '/portfolios/order?action=new',
	    type   : 'post',
	    data   : JSON.stringify(order),
	    contentType: 'application/JSON'

	}).done(function (data) {
	    console.log("response: ",data);
	    $('#msg').text(data.msg);
	    alert(data.msg);
	    if(data.flag){
	    	var id = addOrders(data.orders[0]);
	    	var row = newOrderRow();
	    	updateOrderRow($(row),data.orders[0],id);
	    }

	}).fail(function (xhr, err, status) {
	    alert(data.msg);
	});

}
function newOrderRow() {
	var table = $("#orders_table");
	var row = $("#orders_table .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	row.show();	
	table.append(row);

	$("td", row).click(function() {
		enterFieldEditMode(this);
	});
	$("input", row).blur(function() {
		exitFieldEditMode(this.parentNode);
	}).keypress(function() {
		if (event.keyCode == 13)
			$(event.target).blur();
	});
   	return row;
}

function deleteStockRow() {
	var row = event.target.parentNode.parentNode;
	
	$(event.target).addClass("pressed");
	
	if (window.confirm("\n确实要删除该股票吗？"))
	{
		$(row).remove();
		$("#btnNewStock").show();
	}
	else
		$(event.target).removeClass("pressed");
}
function selectOrderDir() {
	var row = event.target.parentNode.parentNode.parentNode;
	if(row.tagName!="TR")
		return;
	var cell = event.target.parentNode.parentNode;
	var select = $("select", cell);
	var span = $("span", cell);

	if (select.is(":visible") || select.html() == null)
		return;
					
	select.val(span.text());
	select.toggle();
	span.toggle();
	select.focus();
}
function orderDirChanged(it){
	var row = it.parentNode.parentNode.parentNode;
	var cell = it.parentNode;
	var span = $("span", cell);
	var select = $("select", cell);
	span.text(select.val());
	select.toggle();
	span.toggle();
	var id=parseInt($("#o_id",row).text());
	if(id<0){
		return;
	}
	edit_set.add(id);
	var order = getOrders() [id];
	order.Type = span.text();
	setOrders(order,id);
	$("#btnSaveOrder").prop("disabled",false);
}

function updateOrderRow(row,order,id) {
   	$("#o_id"	 , row).text(id);
    	$("#o_portfolio" , row).text(order.Portfolio);
    	$("#o_time"      , row).text(order.Time     );
    	$("#o_code"      , row).text(order.Code     );
    	$("#o_name"      , row).text(order.Name     );
    	$("#o_type"      , row).text(order.Type     );
    	$("#o_price"     , row).text(order.Price    );
    	$("#o_volume"    , row).text(order.Volume   );
    	$("#o_fee"       , row).text(order.Fee      );

}

function getOrders(){
	return g_orders;
}
function addOrders(order){
	g_orders.push(order);
	return g_orders.length - 1;
}
function setOrders(order,id){
	g_orders[id]=order;
	return;
}
function setAutoComplete(input, row) {
	// http://suggest3.sinajs.cn/suggest/type=&key=flzc&name=gpdm
	input.autocomplete(stockInfos, {
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
			$("#o_name", row).text(item.name);
			$("#o_code", row).text(item.code);
			var id = parseInt($("#o_id", row).text());
			if(id<0){
				return;
			}
			edit_set.add(id);
			var orders = getOrders();
			if(orders.length<1){
				return;
			}
			var order = orders[id];
    			order.Code     =item.code;
    			order.Name     =item.name;
			setOrders(order,id);
			$("#btnSaveOrder").prop("disabled",false);
		}
	); 
}
