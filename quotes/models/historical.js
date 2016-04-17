'use strict';
var moment = require('moment');
var orm = require('orm');
var historical_TB = {
    Code             : { type : 'text', key      : true, required : true},
    Date             : { type : 'date', key      : true, required : true},
    Open             : { type : 'number', required : false},
    High             : { type : 'number', required : false},
    Low              : { type : 'number', required : false},
    Close            : { type : 'number', required : false},
    Volume           : { type : 'number', required : false}
};

var methods_m = {
    serialize: function () {
        return {
            Code             :  this.Code      ,
            Date             :  this.Date      ,
            Open             :  this.Open      ,
            High             :  this.High      ,
            Low              :  this.Low       ,
            Close            :  this.Close     ,
            Volume           :  this.Volume    
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
    }
};

var validations_m = {
    Code: [
        orm.enforce.ranges.length(4, 16, '代码长度不合法。')
    ]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('Historical', historical_TB, fun_define);
};

