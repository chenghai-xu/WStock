'use strict';
var moment = require('moment');
var orm = require('orm');
var index_code_TB = {
    Code             : { type : 'text', key      : true, required : true},
    Name             : { type : 'text', key      : true, required : true}
};

var methods_m = {
    serialize: function () {
        return {
            Code             :  this.Code      ,
            Name             :  this.Name    
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
    }
};

var validations_m = {
    Code: [
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
  return db.define('Index_Code', index_code_TB, fun_define);
};

