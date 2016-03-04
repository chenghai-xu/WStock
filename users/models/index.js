var orm      = require('orm');
var settings = require('../../config/settings');
var user_model = require('./users');

module.exports = function (app) {
    app.use(orm.express("sqlite:./data/users_db.sqlite", {
        define: function (req, res, next) {
            res.users = user_model(req);
            next();
        }
    }));
};

