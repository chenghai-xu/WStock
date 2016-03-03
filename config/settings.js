var path       = require('path');

var settings = {
  path       : path.normalize(path.join(__dirname, '..')),
  port       : process.env.PORT || 7891,
  database   : 'sqlite: ./data/users.db'
  //database   : {
  //  protocol : "sqlite", // or "mysql"
  //  query    : { pool: true },
  //  host     : "127.0.0.1",
  //  database : "users.db"
  //  //user     : "anontxt",
  //  //password : "apassword"
  //}
};

module.exports = settings;
