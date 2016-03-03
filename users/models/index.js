var orm      = require('orm');
var settings = require('../../config/settings');
var user_model = require('./users');

module.exports = function (app) {
    app.use(orm.express("sqlite:./data/users_db.sqlite", {
        define: function (db, models, next) {
            models.users = user_model(orm,db);
            next();
        }
    }));
};

