'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    uid              : { type : 'text', required : true, key : true},
    Owner            : { type : 'text', required : true, key : true},
    Name             : { type : 'text', required : true},
    Current_Position : { type : 'text'},
    Current_NV_Time  : { type : 'date', time     : true   },
    Order_Time       : { type : 'date', time     : true   },
};

var methods_m = {
    serialize: function () {
        return {
            uid              : this.uid             ,
            Owner            : this.Owner           ,
            Name             : this.Name            ,
            Current_Position : this.Current_Position,
            Current_NV_Time  : this.Current_NV_Time ,
            Order_Time       : this.Order_Time 
        };
    }
};

var hooks_m = {
    beforeValidation: function () {
	if(!this.uid){
            this.uid = uuid.v4();
	    this.Order_Time = moment('1900-01-01T00:00:00.000Z').toISOString();
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
  return db.define('portfolio', columns, fun_define);
};
