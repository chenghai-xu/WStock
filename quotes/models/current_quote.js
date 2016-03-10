'use strict';
var moment = require('moment');
var orm = require('orm');
var quotes_TB = {
    Code             : { type : 'text', key      : true, required : true},
    Name             : { type : 'text', required : false},
    Open             : { type : 'number', required : false},
    Close            : { type : 'number', required : false},
    Current          : { type : 'number', required : false},
    High             : { type : 'number', required : false},
    Low              : { type : 'number', required : false},
    Buy              : { type : 'number', required : false},
    Sell             : { type : 'number', required : false},
    Volume           : { type : 'number', required : false},
    Money            : { type : 'number', required : false},
    BuyPrice         : { type : 'object', required : false},
    BuyVolume        : { type : 'object', required : false},
    SellPrice        : { type : 'object', required : false},
    SellVolume       : { type : 'object', required : false},
    Time             : { type : 'date', required : false, time     : true   }
};

var methods_m = {
    serialize: function () {
        return {
            Code             :  this.Code      ,
            Name             :  this.Name      ,
            Open             :  this.Open      ,
            Close            :  this.Close     ,
            Current          :  this.Current   ,
            High             :  this.High      ,
            Low              :  this.Low       ,
            Buy              :  this.Buy       ,
            Sell             :  this.Sell      ,
            Volume           :  this.Volume    ,
            Money            :  this.Money     ,
            BuyPrice         :  this.BuyPrice  ,
            BuyVolume        :  this.BuyVolume ,
            SellPrice        :  this.SellPrice ,
            SellVolume       :  this.SellVolume,
            Time             :  this.Time      
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
  return db.define('Current_Quote', quotes_TB, fun_define);
};
