'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    uid              : { type : 'text', required : true, key : true},
    Portfolio        : { type : 'text', required : true, key : true},
    Time             : { type : 'date', required : true, time     : true   },
    Code             : { type : 'text', required : true},
    Name             : { type : 'text', required : true},
    Type             : { type : 'enum', values: [ "BUY", "SELL", "SUBSCRIBE","REDEEM","DELIVERY","DIVIDEN" ] },
    Price            : { type : 'number', required : true},
    Volume           : { type : 'number', required : true},
    Fee              : { type : 'number', required : true},
    Amount           : { type : 'number'},
    Flag             : { type : 'boolean'}
};

var methods_m = {
    serialize: function () {
        return {
            uid      : this.uid      ,
            Portfolio: this.Portfolio      ,
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
	if(!this.uid){
            this.uid = uuid.v4();
	}
	if(this.Type == 'SELL' || this.Type == 'DIVIDEN'){
	    this.Amount = this.Price * this.Volume - this.Fee;
	}
	else if(this.Type == 'BUY'){
	    this.Amount = this.Price * this.Volume + this.Fee;
	}
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
  return db.define('order', columns, fun_define);
};
