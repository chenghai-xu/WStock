'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    //uid              : { type : 'text', required : true, key : true},
    Portfolio        : { type : 'text', required : true, key : true},
    Code             : { type : 'text', required : true, key : true},
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
            //uid              : uid           ,
            Portfolio        : this.Portfolio     ,
            Code             : this.Code          ,
            Name             : this.Name          ,
            Volume           : this.Volume        ,
            Current_Price    : this.Current_Price ,
            Current_Amount   : this.Current_Amount,
            Cost_Price       : this.Cost_Price    ,
            Cost_Amount      : this.Cost_Amount   ,
            Gain             : this.Gain          ,
            Gain_Rate        : this.Gain_Rate     
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
	//if(!this.uid){
            //this.uid = uuid.v4();
	//}
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
