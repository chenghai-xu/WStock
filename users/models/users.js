'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');

var users_TB = {
    uid         : { type: 'text', key: true, required: true},
    account     : { type: 'text', required: true},
    password    : { type: 'text', required: true},
    email       : { type: 'text', required: true},
    createdAt   : { type: 'date', required: true, time: true   },
    surname     : { type: 'text', required: false},
    middleName  : { type: 'text', required: false},
    givenName   : { type: 'text', required: false}
};

var methods_m = {
      serialize: function () {
        return {
          uid        : this.uid,
          password  : this.password,
          email     : this.email,
          createdAt : moment(this.createdAt).fromNow()
        };
    }
};

var hooks_M = {
      beforeValidation: function () {
        this.createdAt = new Date();
        this.uid  = uuid.v4();
        //console.log("Here is OK, ",this);
      }
};

var validations_M = {
      account: [
        orm.enforce.ranges.length(4, undefined, "must be atleast 4 letter long"),
        orm.enforce.ranges.length(undefined, 16, "cannot be longer than 512 letters")
      ],
      password: [
        orm.enforce.ranges.length(8, undefined, "must be atleast 8 letter long"),
      ]
};

module.exports = function (db) {
  var users = db.define('users', users_TB,
  {
    hooks: hooks_M,
    validations: validations_M,
    methods: methods_m
  });
  return users;
};
