var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');

module.exports = {
    controlers: control,
    models: models,
    bind: bind
};


var models_define = {define: function(req,res,next){
    res.users = models.users(req);
    next();
}}; 

function bind(app) {
    app.use(orm.express("sqlite:./data/users_db.sqlite", models_define));
}

