var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var database = {models:{}};
function connect(){
    orm.connect("sqlite:./data/users.db", function (err, db) {
        if (err) throw err;
        database = db;
        database.models.users = models.users(db);
        db.sync(function(err) { 
            if (err) throw err;
            database.models.users.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of user. count: %s",count);
            });
        });

    });
}

module.exports = {
    init: connect,
    models: models,
    control:control,
    bind: bind
};

function bind(app) {
    app.use(function(req, res, next) {
        req.models.users=database.models.users;
        next();
    });
}

