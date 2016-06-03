$(document).ready(function() {
   init(); 
});

var stopUpdateInfo = false;
var showCode = "sh000001";

function saveOptions()
{	
	var stocks = {};
	var rows = $("#stocksTable .tableRow");
	var stockId = 0;
	
	for (var i = 0; i < rows.length; i++)
	{
		var row = rows[i];

		var flag = $(".flag", row).hasClass("remove") ? 1 : 0;
		
		var stock = {
			stockName: $(".stockName", row).text(),
			stockCode: $(".stockCode", row).text(),
			stockUpPrice: parseFloat($(".stockUpPrice", row).text()).toFixed(2),
			stockDownPrice: parseFloat($(".stockDownPrice", row).text()).toFixed(2),
			stockFlag: flag,
		};
		
		if (stock.stockCode != "")
		{
			stocks[stockId] = stock;
			stockId++;
		}
    }
	
	Settings.setObject("stockListStocks", stocks);
	
	if (rows.length < Settings.getValue("popupStockPosition"))
		Settings.setValue("popupStockPosition", 0);
	
	
}



function selectFigureType(p_t){
		setFigureSrc();
}

function setFigureSrc(){
		var tech = $("#period_tech").val();
		$("#img_min").attr("src","http://image.sinajs.cn/newchart/min/n/"+showCode+".gif");
		$("#img_daily").attr("src","http://image.sinajs.cn/newchart/"+tech+"/n/"+showCode+".gif");
}

function init() {
	initializeTabs();
	
	$("#btnNewStock").click(function() { newStockRow(undefined, true); });
	$("#btnLoadStock").click(function() { updateStockPriceNew(); });
	$("#btnSaveStock").click(function() { saveOptions(); });
	
	$("#stocksTable").delegate(".delete", "click", function(){ deleteStockRow(); });
	$("#stocksTable").delegate(".flag", "click", function(){ flagStock(); });
	$("#stocksTable #template").hide(); 
	
    initializeStockRow();
    updateStockPriceNew();
    window.setTimeout(updateStockPriceLoop, 0);
}
function initializeTabs() {
	$("#options > div").hide();
	$("#custom-stock-infos").show();
}
function initializeStockRow() {
	$("#stocksTable .tableRow").remove();
	var stockListStocks = Settings.getObject("stockListStocks");

	if (undefined != stockListStocks) {
		
		for (var i in stockListStocks) {
			var stock = stockListStocks[i];
			newStockRow(stock, false);
		}
	}
	else
		newStockRow(undefined, true);

	$("#stocksTable tr.tableRow:odd").addClass("odd");
	
	$("#stocksTable").tableDnD({
		onDragClass: "myDragClass",
        onDrop: function(table, row) {
            stopUpdateInfo = false;
            $("#stocksTable tr.tableRow:odd").addClass("odd");
            $("#stocksTable tr.tableRow:even").removeClass("odd");
        },
        onDragStart: function(table, row) {
			stopUpdateInfo = true;
		},
        dragHandle: "dragHandle"
    });
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
			$(".stockName", row).text(item.name);
			$(".stockCode", row).text(item.code);
			//updateStockInfo(row);
			var codeList = new Array(1);
			codeList[0]=item.code;
			updateStocksNew(codeList,function(stockInfos){
				updateStockInfoNew(row,stockInfos[0]);
			});
		}
	); 
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
	
	if (input.attr("id") == "stockName")
		setAutoComplete(input, span.parent().parent().parent());
}

function exitFieldEditMode(cell) {
	var input = $("input", cell);
	var span = $("span", cell);
	var newValue = input.val();
	
	input.toggle();
    span.toggle();
    var codeList = new Array(1);
    codeList[0]=newValue;

	if (input.attr("id") != "stockName") {
		span.text(newValue);
	} else {
		var patrn=/^s[hz]{1}[0-9]{6}$/;
		if (patrn.exec(newValue)) {
			var row = span.parent().parent().parent();
			$(".stockCode", row).text(newValue);
			updateStocksNew(codeList,function(stockInfos){
				updateStockInfoNew(row,stockInfos[0]);
			});
		}
	}
	
	if (input.attr("id") != "stockName") {
		updateStocksNew(codeList,function(stockInfos){
			updateStockInfoNew(span.parent().parent().parent(),stockInfos[0]);
		});
	}
}

function updateStockPriceLoop(){
	
	if (isOperation())
	{
		updateStockPriceNew();
	}
	window.setTimeout(updateStockPriceLoop, 20000);
}
function updateStockPriceNew() {
    var btn = $("#btnLoadStock"); 
    btn.prop("disabled", true);
    var rows = $("#stocksTable .tableRow");
    if(rows.length<1)
        return;
    var codeList = new Array(rows.length);
    for (var i = 0; i < rows.length; i++) {
   		codeList[i] = $(".stockCode", rows[i]).text();
	   $(".stockPrice", rows[i]).html("<img alt=\"获取价格中\" src=\"images/loading.gif\" height=\"13px\">");
    }
    updateStocksNew(codeList,function(stockInfos){
        setTimeout(function(){
            for(var i=0; i< rows.length;i ++){
                updateStockInfoNew($(rows[i]),stockInfos[i]);
            }
            btn.prop("disabled", false);
        },0);
    });
}

function newStockRow(stock, activate) {
	var table = $("#stocksTable");
	var row = $("#stocksTable .templateRow").clone();
	
	row.removeClass("templateRow").addClass("tableRow");	
	row.show();	
	table.append(row);

	$("td", row).click(function() {
		enterFieldEditMode(this);
	});
	$("input", row).blur(function() {
		exitFieldEditMode(this.parentNode);
	}).keypress(function() {
		if (event.keyCode == 13) // Enter Key
			$(event.target).blur();
	});
	
	$(".stockCode", row).click(function() {
		showCode=$(this).text();
		setFigureSrc();
	});
	
	if (stock) {
		$(".stockName", row).text(stock.stockName);
		$(".stockCode", row).html(stock.stockCode);
		$(".stockUpPrice", row).text(stock.stockUpPrice);
		$(".stockDownPrice", row).text(stock.stockDownPrice);

		if ( typeof(stock.stockFlag) != "undefined" && stock.stockFlag == 1 ) {
			$(".flag", row).addClass("remove").attr("title", "取消标记置顶");
		}
		else {
			$(".flag", row).addClass("add").attr("title", "标记置顶状态");;
		}
		
		if (Settings.getValue("note_" + stock.stockCode, "") != "") {
			$(".note", row).addClass("pressed");
		}
	}
	else {
		$(".dragHandle", row).removeClass("dragHandle").attr("title", "");
	}

	if (activate) {
		$("td:first", row).click();
		$("td:first input", row).select();
	}
}

function flagStock() {
	var oFlag = ($(event.target));
	if ( oFlag.hasClass("add") ) {
		oFlag.removeClass("add").addClass("remove").attr("title", "取消标记置顶");
		console.log("add");
	} 
	else if ( oFlag.hasClass("remove") ) {
		oFlag.removeClass("remove").addClass("add").attr("title", "标记置顶状态");
		console.log("remove");
	}

	console.log("flag");
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

function importStock() {	
	var json = $("#txtBackup").val();
    if (json && json != "")
    {
        try {
			stockInfos = JSON.parse(json);
	
			if (undefined != stockInfos) {
				Settings.setObject("stockListStocks", stockInfos);
				
				Settings.setValue("popupStockPosition", 0);
				
				initializeStockRow();
				
				saveOptions();
				
			}
        }
        catch(e) {
			console.log(e);
		}
    }
}

function updateStockInfoNew(row,stockInfo) {
  	console.log("Update code: "+stockInfo.stockCode);
	if ($(".stockCode", row).text() == "")
		return;

	if (stopUpdateInfo == true)
		return;
	
   if (stockInfo == undefined) {
   	if ( $(".stockName", row).text() == "" ) {
   		$(".stockCode", row).text("");
   		$(".stockPrice", row).text("获取失败");
   	}
   }
   else {
   	$(".stockName", row).text(stockInfo.stockName);
   	if (stockInfo.stockOpenPrice == 0) {	
   		row.removeClass("stockUp").removeClass("stockDown").addClass("stockStop");
   	}
   	else {
   		if (parseFloat(stockInfo.stockChangeAmt) >= 0) {
   			row.removeClass("stockStop").removeClass("stockDown").addClass("stockUp");
   		}
   		else {
   			row.removeClass("stockStop").removeClass("stockUp").addClass("stockDown");
   		}
   		
   		stockCurrPrice = parseFloat(stockInfo.stockCurrPrice);
   		
   		oStockUpPrice = $(".stockUpPrice", row);
   		stockUpPrice = parseFloat(oStockUpPrice.text());
   		if (stockUpPrice != 0 && stockCurrPrice > stockUpPrice) {
   			oStockUpPrice.addClass("stockUp");
   		}
   		else {
   			oStockUpPrice.removeClass("stockUp");
   		}
   		
   		oStockDownPrice = $(".stockDownPrice", row);
   		stockDownPrice = parseFloat(oStockDownPrice.text());
   		if ( stockDownPrice != 0 && stockCurrPrice < stockDownPrice) {
   			oStockDownPrice.addClass("stockDown");
   		}
   		else {
   			oStockDownPrice.removeClass("stockDown");
   		}
   	}
   	
   	$(".stockOpenPrice", row).text(stockInfo.stockOpenPrice);
   	$(".stockClosePrice", row).text(stockInfo.stockClosePrice);
   	$(".stockMaxPrice", row).text(stockInfo.stockMaxPrice);
   	$(".stockMinPrice", row).text(stockInfo.stockMinPrice);
   	
   	if (parseFloat(stockInfo.stockOpenPrice) == 0) {
   		$(".stockPrice", row).text("0.00");
   		$(".stockChangeAmt", row).text("0.00");
   		$(".stockChangeRate", row).text("0.00%");
   	}
   	else {
   		$(".stockPrice", row).text(stockInfo.stockCurrPrice);
   		
   		if (stockInfo.stockChangeRate < 0) {
   			$(".stockChangeAmt", row).text(stockInfo.stockChangeAmt);
            $(".stockChangeRate", row).html(stockInfo.stockChangeRate + "%");
            var per = Math.floor(-stockInfo.stockChangeRate*8);
            $(".stockChangeRate", row).parent().attr("style","background-color: green; width: "+per+"px;");
   		}
   		else {
   			$(".stockChangeAmt", row).text("+" + stockInfo.stockChangeAmt);
            $(".stockChangeRate", row).html("+" + stockInfo.stockChangeRate + "%");
            var per = Math.floor(stockInfo.stockChangeRate*8);
            $(".stockChangeRate", row).parent().attr("style","background-color: red; width: "+per+"px;");
   		}
   	}
   }

}

