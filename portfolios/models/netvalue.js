'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    Portfolio        : { type : 'text', required : true, key : true},
    Time             : { type : 'text', required : true, key : true},
    Share            : { type : 'number'},
    Value            : { type : 'number'},
    Total            : { type : 'number'}
};

var methods_m = {
    serialize: function () {
        return {
            Portfolio        : this.Portfolio ,
            Time             : this.Time      ,
            Share            : this.Share     ,
            Value            : this.Value     ,
            Total            : this.Total      
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
    },
    beforeSave: function(){
    }
};

var validations_m = {
    //label: [
        //orm.enforce.ranges.length(1, 256, '标签长度不合法'),
    //]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('netvalue', columns, fun_define);
};
