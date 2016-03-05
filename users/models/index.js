var orm      = require('orm');
var settings = require('../../config/settings');
var user_model = require('./users');

/*
var models = {};
var users_db = {};

orm.connect("sqlite:./data/users_db.sqlite", function (err, db) {
 if (err) throw err;

    models.users = user_model(db);
    users_db = db;
    db.sync(function(err) { 
        if (err) throw err;
        models.users.create({ account: "test", password: "12345678", email: "test@163.com"}, function(err) {
            if (err) throw err;
        });
        models.users.find().all(function (err, users) {
          	if (err) {console.log(err);return;}
         	console.log("Init models of users. count: %s",users.length);
       });
    });
});
*/

function tables_define(req, res, next) {
	res.users = user_model(req);
	next();
}
module.exports = function (app) {
    app.use(orm.express("sqlite:./data/users_db.sqlite", {
    	define: tables_define
    }));
    /*
    app.use(function(req,res,next){
    	req.models.users.find().all(function(err,users){
    		console.log('Set models to req.models, users count: %s.', users.length);
    	});
    	next();
    });
    */
};

