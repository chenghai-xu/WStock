var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var database = {models:{}};

function connect(){
    orm.connect("sqlite:./data/notes.db", function (err, db) {
        if (err) throw err;
        database = db;
        database.models.note = models.note(db);
        db.sync(function(err) { 
            if (err) throw err;
            database.models.note.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of note. count: %s",count);
            });
        });

    });
}

function create_note(req, res, next){
    var info={flag:false,msg:'请先登录。'};
    if(!req.isAuthenticated()){
        return res.json(info);
    }
    var params = {
        owner: req.user.uid,
        title: req.body.title,
        content: req.body.content};
        //*/
    console.log("create note: ",params);
    //info.msg='test';
    //return res.json(info);
    control.note.create(req.models.note,params,function(created){
        /*
        info.flag=created;
        if(!created.flag){
            info.msg='新建成功';
            console.log(info);
            return res.json(info);
        }
        */
        return res.json(created);

    });
}
function bind(app){
    app.use(function(req, res, next) {
        req.models.note=database.models.note;
        next();
    });
}


module.exports = {
    //models: database.models,
    //models: function(){return database.models},
    bind: bind,
    controlers: control,
    init: connect,
    create_note: create_note
};

