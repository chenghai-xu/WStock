$(document).ready(function() {
   init(); 
});

function init() {
	$('#btnNewOrder').click(function(){createOrder();});
	$("#btnSaveOrder").click(function() { saveOrder(); });
	$("#orders_table").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#orders_table").delegate("#order_dir", "click", function(){ selectOrderDir(); });
	$("#btnSaveOrder").prop("disabled",true);
    updateOrders();
}

function updateOrders() {
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
    },0);

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
    	$("#o_amount"    , row).text(order.Amount   );

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

