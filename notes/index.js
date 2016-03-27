var orm      = require('orm');
var settings = require('../config/settings');
var models = require('./models/index');
var control = require('./controlers/index');
var msg2view = require('../views/msg2view');
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
    console.log("create note: ",params);
    control.note.create(req.models.note,params,function(created){
        return res.json(created);

    });
}
function bind(app){
    app.use(function(req, res, next) {
        req.models.note=database.models.note;
        next();
    });
}
function list_note(req, res, next) {
    if(req.isAuthenticated()){ 
        control.note.list(req.models.note,{owner:req.user.uid},function(info){
            if(!info.flag){
                res.redirect('/');
                return;
            }
            var view_info = msg2view.msg(req);
            view_info.notes = info.notes;
            console.log(view_info);
            res.render('note_book',view_info);
        });
    }
    else{
        res.redirect('/login');
    }
}
function get_note(req, res, next) {
    if(req.query.uid == undefined){
        res.redirect('/note_book');
        return;
    }
    if(req.isAuthenticated()){ 
        control.note.get(req.models.note,{uid:req.query.uid,owner:req.user.uid},function(info){
            if(!info.flag){
                res.redirect('/');
                return;
            }
            var view_info = msg2view.msg(req);
            view_info.notes = info.notes;
            console.log(view_info);
            res.render('note',view_info);
        });
    }
    else{
        res.redirect('/login');
    }
}

function save_note(req, res, next){
    var info={flag:false,msg:'请先登录。'};
    if(!req.isAuthenticated()){
        return res.json(info);
    }
    var params = {
        uid: req.body.uid,
        owner: req.user.uid,
        title: req.body.title,
        content: req.body.content};
    console.log("save note: ",params);
    control.note.save(req.models.note,params,function(saved){
        return res.json(saved);

    });
}

module.exports = {
    bind: bind,
    controlers: control,
    init: connect,
    create_note: create_note,
    list_note: list_note,
    get_note: get_note,
    save_note: save_note
};

