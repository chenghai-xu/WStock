$(document).ready(function() {
    updatePositions();
});

function updatePositions() {
    var rows = $("#positions_table .tableRow");
    var Positions = getPositions();
    for(var i=0; i<Positions.length - rows.length;i++){
    	newpositionRow();
    }
    rows = $("#positions_table .tableRow");
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
   	$("#p_portfolio"   , row).text(position.Portfolio     );
   	$("#p_code"        , row).text(position.Code          );
   	$("#p_name"        , row).text(position.Name          );
   	$("#p_volume"      , row).text(position.Volume        );
   	$("#p_price"       , row).text(position.Current_Price );
   	$("#p_amount"      , row).text(position.Current_Amount);
   	$("#p_price_cost"  , row).text(position.Cost_Price    );
   	$("#p_amount_cost" , row).text(position.Cost_Amount   );
   	$("#p_gain"        , row).text(position.Gain          );
   	$("#p_gain_rate"   , row).text(position.Gain_Rate     );
}

function getPositions(){
	return g_positions;
}
function addPositions(position){
	g_positions.push(position);
	return g_Positions.length - 1;
}
function setPositions(position,id){
	g_positions[id]=position;
	return;
}
