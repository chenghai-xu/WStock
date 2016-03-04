var orm = require("orm");
var users = require("./users/models/users");

orm.connect("sqlite:./data/users_db.sqlite", function (err, db) {
 if (err) throw err;

    var Person = users(db);
    db.sync(function(err) { 
        if (err) throw err;

        Person.create({ account: "test", password: "12345678", email: "test@163.com"}, function(err) {
            if (err) throw err;
        });
        Person.find().all(function (err, users) {
          if (err) {console.log(err);return;}

          var items = users.map(function (m) {
            return m.serialize();
          });

         console.log(items);
       });
    });
});
