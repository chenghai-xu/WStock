'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    uid              : { type : 'text', required : true, key : true},
    Portfolio        : { type : 'text', required : true, key : true},
    Code             : { type : 'text', required : true},
    Name             : { type : 'text', required : true},
    Volume           : { type : 'number', required : true},
    Current_Price    : { type : 'number'},
    Current_Amount   : { type : 'number'},
    Cost_Price       : { type : 'number'},
    Cost_Amount      : { type : 'number'},
    Gain             : { type : 'number'},
    Gain_Rate        : { type : 'number'}
};

var methods_m = {
    serialize: function () {
        return {
            uid              : uid           ,
            Portfolio        : Portfolio     ,
            Code             : Code          ,
            Name             : Name          ,
            Volume           : Volume        ,
            Current_Price    : Current_Price ,
            Current_Amount   : Current_Amount,
            Cost_Price       : Cost_Price    ,
            Cost_Amount      : Cost_Amount   ,
            Gain             : Gain          ,
            Gain_Rate        : Gain_Rate     
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
	if(!this.uid){
            this.uid = uuid.v4();
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
  return db.define('position', columns, fun_define);
};
