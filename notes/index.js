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
        database.models.label = models.label(db);
        db.sync(function(err) { 
            if (err) throw err;
            database.models.note.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of note. count: %s",count);
            });
            database.models.label.count(function (err, count) {
                if (err) {console.log(err);return;}
                console.log("Init models of label. count: %s",count);
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
        req.models.label=database.models.label;
        next();
    });
}
function sort_labels(notes,labels,cb){
    for(var i=0; i<labels.length;i++){
        for(var j=0; j<notes.length;j++){
            if(labels[i].uid == notes[j].uid){
                notes[j].labels.push(labels[i].label);
            }
        }
    }
    cb();
}
function list_note(req, res, next) {
    if(!req.isAuthenticated()){ 
        res.redirect('/login');
    }
    control.note.list(req.models.note,{owner:req.user.uid},function(info){
        if(!info.flag){
            res.redirect('/');
            return;
        }
        var view_info = msg2view.msg(req);
        view_info.notes = info.notes;
        for(var i=0; i<view_info.notes.length; i++){
            view_info.notes[i].labels= new Array();
        }
        var q_array=[];
        for(var i=0;i<view_info.notes.length;i++){
            q_array[i]={uid:view_info.notes[i].uid,owner:view_info.notes[i].owner};
        }
        var query = {or:q_array};
        control.label.find(req.models.label,query,function(result){
            sort_labels(view_info.notes,result.labels,function(){
                //console.log(view_info);
                res.render('note_book',view_info);
            });
        });
    });

}
function get_note(req, res, next) {
    if(req.query.uid == undefined){
        res.redirect('/note_book');
        return;
    }
    if(!req.isAuthenticated()){ 
        res.redirect('/login');
    }
    control.note.get(req.models.note,{uid:req.query.uid,owner:req.user.uid},function(info){
        if(!info.flag){
            res.redirect('/');
            return;
        }
        var view_info = msg2view.msg(req);
        view_info.notes = info.notes;
        if(view_info.notes.length<1){
            res.render('note',view_info);
            return;
        }
        var query={uid:view_info.notes[0].uid,owner:view_info.notes[0].owner};
        control.label.get(req.models.label,query,function(note_labels){
            view_info.notes[0].labels=note_labels.labels;
            //console.log(view_info);
            res.render('note',view_info);
        });
    });
}

function save_note(req, res, next){
    var info={flag:false,msg:'请先登录。'};
    if(!req.isAuthenticated()){
        return res.json(info);
    }
    if(req.query.edit=='note'){
        var params = {
            uid: req.body.uid,
            owner: req.user.uid,
            title: req.body.title,
            content: req.body.content};
        //console.log("save note: ",params);
        control.note.save(req.models.note,params,function(saved){
            return res.json(saved);

        });
    }
    else if(req.query.edit=='label'){
        var note_labels = new Array();
        for(var i=0; i<req.body.labels.length;i++){
            note_labels[i]={uid:req.body.uid,owner: req.user.uid,label:req.body.labels[i]};
        }
        console.log('Create labels', note_labels);
        control.label.create(req.models.label, note_labels, function(created){
            return res.json(created);
        });
    }
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

