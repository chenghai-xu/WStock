$(document).ready(function() {
   init(); 
});

function savePortfolio(portfolio,id)
{	
	console.log("change portfolio, id: %s, ",id,portfolio);
	$.ajax({
	    url    : '/portfolios/portfolio?action=edit',
	    type   : 'post',
	    data   : JSON.stringify(portfolio),
	    contentType: 'application/JSON'

	}).done(function (data) {
	    console.log("response: ",data);
	    alert(data.msg);
	    if(data.flag){
	    	rows = $("#portfolios_table .tableRow");
	    	updatePortfolioRow($(rows[id]),portfolio,id);
	    }

	}).fail(function (xhr, err, status) {
	    alert(data.msg);
	});
}

function init() {
	$('#form-new-portfolio').submit(createPortfolio);
	$("#btnLoadPortfolio").click(function() { updatePortfolios(); });
	
	//$("#portfolios_table").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#portfolios_table").delegate("td", "click", function(){ open_position(); });
    updatePortfolios();
    window.setTimeout(updatePortfolioLoop, 0);
}

function enterFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);

	if (input.is(":visible") || input.html() == null)
		return;
					
	input.val(span.text());
	input.toggle();
	span.toggle();
	input.focus();
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
	var id = parseInt($("#p_id", row).text());
	if(id<0){
		return;
	}
	var portfolios = getPortfolios();
	if(portfolios.length<1){
		return;
	}
	var portfolio = portfolios[id];
	portfolio.Name = newValue;
	savePortfolio(portfolio,id);
}

function updatePortfolioLoop(){
	
	if (isOperation())
	{
		updatePortfolios();
	}
	window.setTimeout(updatePortfolioLoop, 60000);
}
function updatePortfolios() {
    var btn = $("#btnLoadPortfolio"); 
    btn.prop("disabled", true);
    var rows = $("#portfolios_table .tableRow");
    var portfolios = getPortfolios();
    for(var i=0; i<portfolios.length - rows.length;i++){
    	newPortfolioRow();
    }
    rows = $("#portfolios_table .tableRow");
    setTimeout(function(){
        for(var i=0; i< portfolios.length;i ++){
            updatePortfolioRow($(rows[i]),portfolios[i],i);
        	}
        btn.prop("disabled", false);
    },0);

}

function createPortfolio() {
	var portfolio = {};
	portfolio.uid = null;
	portfolio.Name = $("#form-new-portfolio #portfolio-name").val();
	console.log("create portfolio: ",portfolio);
	$.ajax({
	    url    : '/portfolios/portfolio?action=new',
	    type   : 'post',
	    data   : JSON.stringify(portfolio),
	    contentType: 'application/JSON'

	}).done(function (data) {
	    console.log("response: ",data);
	    $('#msg').text(data.msg);
	    alert(data.msg);
	    if(data.flag){
      		window.setTimeout(function(){$('#input-modal').modal('hide');}, 1000);
	    	var id = addPortfolios(data.portfolios[0]);
	    	var row = newPortfolioRow();
	    	updatePortfolioRow($(row),data.portfolios[0],id);
	    }

	}).fail(function (xhr, err, status) {
	    alert(data.msg);
	});

}
function newPortfolioRow() {
	var table = $("#portfolios_table");
	var row = $("#portfolios_table .templateRow").clone();
	
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
/* 
   	if (activate) {
   		$("td:first", row).click();
   		$("td:first input", row).select();
   	}
   	*/
   	return row;
}

function portfolio_action(it){
	var row = it.parentNode.parentNode.parentNode;
	var cell = it.parentNode;
	var select = $("select", cell);
	var action=select.val();
	var id=parseInt($("#p_id",row).text());
	if(id<0){
		return;
	}
	if(action=="Order"){
		openOrder(id);
	}
	else if(action=="Position"){
		openPosition(id);
	}
	else if(action=="NetValue"){
		openNetValue(id);
	}

	//var portfolio = getPortfolios() [id];
	//setOrders(order,id);
}

function open_position(id) {
	var row = event.target.parentNode.parentNode;
	if(row.tagName!="TR"){
		return;
	}
	var id = parseInt($("#p_id",row).text());
	if(isNaN(id)){
		return;
	}
	openPosition(id);
}
function openOrder(id) {
	var portfolios = getPortfolios();
	var uid = portfolios[id].uid;
	if(uid==null)
		return;
	window.location = "/portfolios/order?portfolio="+uid;
}
function openPosition(id) {
	var portfolios = getPortfolios();
	var uid = portfolios[id].uid;
	if(uid==null)
		return;
	window.location = "/portfolios/position?portfolio="+uid;
}
function openNetValue(id) {
	var portfolios = getPortfolios();
	var uid = portfolios[id].uid;
	if(uid==null)
		return;
	window.location = "/portfolios/netvalue?portfolio="+uid;
}

function updatePortfolioRow(row,portfolio,id) {
   	$("#p_id", row).text(id);
  	$("#p_name", row).text(portfolio.Name);
   	$("#p_total", row).text((portfolio.Cash+portfolio.Asset).toFixed(4));
   	$("#p_cash", row).text(portfolio.Cash.toFixed(4));
   	$("#p_asset", row).text(portfolio.Asset.toFixed(4));
   	$("#p_cost", row).text(portfolio.Cost.toFixed(4));
   	$("#p_gain", row).text(portfolio.Gain.toFixed(4));
   	$("#p_gain_rate", row).text(portfolio.Gain_Rate.toFixed(4)+'%');
    if(portfolio.Gain>0){
        $("#p_gain", row).parent().addClass("gain_up").removeClass("gain_down");
        $("#p_gain_rate", row).parent().addClass("gain_up").removeClass("gain_down");
    }
    else{
        $("#p_gain", row).parent().addClass("gain_down").removeClass("gain_up");
        $("#p_gain_rate", row).parent().addClass("gain_down").removeClass("gain_up");
    }

}

function getPortfolios(){
	return g_portfolios;
}
function addPortfolios(portfolio){
	g_portfolios[g_portfolios.length]=portfolio;
	return g_portfolios.length - 1;
}
function setPortfolios(portfolio,id){
	return g_portfolios[id]=portfolio;
}
