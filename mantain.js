var quotes = require('./quotes/index');
var portfolios = require('./portfolios/index');
var moment = require('moment');
quotes.init();
portfolios.init(quotes);
portfolios.event.on('ready',mantain);
function mantain(database){
	console.log('mantain portfolio data');
	portfolios.mantain();
}
function wait(){
	setTimeout(wait,5*1000);
}

//setTimeout(wait,5*1000);
