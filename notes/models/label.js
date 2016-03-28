'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var columns = {
    uid               : { type : 'text', required : true, key : true},
    owner             : { type : 'text', required : true, key : true},
    label             : { type : 'text', required : true, key : true}
};

var methods_m = {
    serialize: function () {
        return {
            uid      : this.uid      ,
            owner    : this.owner      ,
            label    : this.label
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
    label: [
        orm.enforce.ranges.length(1, 256, '标签长度不合法'),
    ]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('label', columns, fun_define);
};
