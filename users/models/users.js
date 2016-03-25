'use strict';
var moment = require('moment');
var orm = require('orm');
var uuid = require('node-uuid');
var account_pattern=/^[a-zA-Z][\w\-_\.]/;
var email_pattern=/^[\w\.\-_]+@[\w\-_]+(\.[\w\-_]+){1,4}$/;
function valide_account(account) {
    return account_pattern.test(account);
}
function valide_email(email) {
    return email_pattern.test(email);
}

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
          uid       : this.uid,
          account   : this.account,
          password  : this.password,
          email     : this.email,
          createdAt : moment(this.createdAt).fromNow()
        };
    }
};

var hooks_m = {
      beforeValidation: function () {
        this.createdAt = moment().add(-8,'hours').toDate() ;
        this.uid  = uuid.v4();
      }
};

var validations_m = {
      account: [
        orm.enforce.ranges.length(4, 32, '帐号长度须在4-32位之间。'),
        orm.enforce.patterns.match(account_pattern,null,'帐号格式不合法。'),
        orm.enforce.unique({ignoreCase: true},'账号已被注册。')
      ],
      password: [
        orm.enforce.ranges.length(8, undefined, '密码长度至少8位。'),
      ],
      email: [
        orm.enforce.patterns.email('邮箱格式不合法。'),
        orm.enforce.unique({ignoreCase: true},'邮箱已被注册。')
      ]
};

var fun_define = {
    hooks: hooks_m,
    validations: validations_m,
    methods: methods_m
};

module.exports = function (db) {
  return db.define('users', users_TB, fun_define);
};
