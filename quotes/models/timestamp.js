'use strict';
var moment = require('moment');
var orm = require('orm');
var columns = {
    Name             : { type : 'text', key      : true, required : true},
    Create           : { type : 'date', required : true, time    : true},
    Write            : { type : 'date', required : true, time    : true},
    Read             : { type : 'date', required : true, time    : true}
};

var methods_m = {
    serialize: function () {
        return {
            Name             :  this.Name      ,
            Create           :  this.Create      ,
            Read             :  this.Read      ,
            Write            :  this.Write      
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
        //Bug fix try, db: SQLITE3, ORM: ORM2
        //Description: The create/update action will add 8 hours to the datetime,
        //while selected datetime does not add -8 hours. 
        //Fixed: So before create/update action we add -8 hours to balance it.
        if(!this.Create){
            this.Create = moment().add(-8,'hours').toDate() ;
            this.Write = this.Create;
            this.Read = this.Create;
        }
    }
};

var validations_m = {
    Name: [
        orm.enforce.ranges.length(4, 16, '代码长度不合法。'),
        orm.enforce.unique({ignoreCase: true})
    ]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('timestamp', columns, fun_define);
};
