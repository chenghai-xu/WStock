'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var note_TB = {
    uid               : { type : 'text', required : true, key      : true},
    owner             : { type : 'text', required : true                 },
    created           : { type : 'date', required : true, time     : true},
    updated           : { type : 'date', required : true, time     : true},
    title             : { type : 'text', required : true},
    content           : { type : 'text'}
};

var methods_m = {
    serialize: function () {
        return {
            uid      : this.uid      ,
            owner    : this.owner      ,
            created  : this.created      ,
            updated  : this.updated     ,
            title    : this.title   ,
            content  : this.content
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
        //Bug fix try, db: SQLITE3, ORM: ORM2
        //Description: The create/update action will add 8 hours to the datetime,
        //while selected datetime does not add -8 hours. 
        //Fixed: So before create/update action we add -8 hours to balance it.
        if(this.uid){
            return;
        }
        //this.created = moment().add(-8,'hours').toDate() ;
        this.created = moment().toDate() ;
        this.updated = this.created;
        this.uid  = uuid.v4();
    },
    beforeSave: function(){
        //this.updated = moment().add(-8,'hours').toDate() ;
        this.updated = moment().toDate() ;
    }
};

var validations_m = {
    title: [
        orm.enforce.ranges.length(1, 1024, '标题长度不合法'),
    ]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('note', note_TB, fun_define);
};
