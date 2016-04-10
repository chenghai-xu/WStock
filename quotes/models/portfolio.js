'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    uid              : { type : 'text', required : true, key : true},
    Owner            : { type : 'text', required : true, key : true},
    Name             : { type : 'text', required : true},
    Current_Position : { type : 'text'},
    Current_NV_Time  : { type : 'text'}
};

var methods_m = {
    serialize: function () {
        return {
            uid      : this.uid      ,
            Owner: this.Owner      ,
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
