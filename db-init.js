var orm = require("orm");
var users = require("./users/models/users");
var database=null;
function list(){
    database.models.users.find().all(function (err, users) {
        if (err) {console.log(err);return;}

        var items = users.map(function (m) {
            return m.serialize();
        });

        console.log(items);
    });
}

function remove(){
    database.models.users.find().remove(function (err) {
        if (err) {console.log(err);return;}
        console.log('remove all items');
    });
}

orm.connect("sqlite:./data/users_db.sqlite", function (err, db) {
    if (err) throw err;

    database=db;
    database.models={};
    //var Person = users(db);
    database.models.users = users(db);
    db.sync(function(err) { 
        if (err) throw err;
    });
    list();
    //remove();
    /*
    Person.find().all(function (err, users) {
        if (err) {console.log(err);return;}

        var items = users.map(function (m) {
            return m.serialize();
        });

        console.log(items);
    });
    */
});
