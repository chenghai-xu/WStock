$(document).ready(function () {
  initSignUpIn();
});

function initSignUpIn(){
    $('#form-sign-in').submit(sign_in);
    $('#form-sign-up').submit(sign_up);
}

function sign_in(e){
  var loginForm = $('#form-sign-in');
  var sha_pass = $('#form-sign-in #sha_pass');
  var password = $('#form-sign-in #password');
  var shaObj = new jsSHA("SHA-512","TEXT");
  shaObj.update(password.val());
  sha_pass.val(shaObj.getHash("HEX"));
  $.ajax({
    url    : '/login',
    type   : 'post',
    data   : loginForm.serialize()
  }).done(function (data) {
    $('#form-sign-in #msg').text(data.login.msg);
    if(data.login.flag){
      window.setTimeout(function(){$('#sign-in').modal('hide');}, 1000);
    }

  }).fail(function (xhr, err, status) {
    $('#form-sign-in #msg').text(err);
  });

  //});
}
  

function sign_up(e){
  var loginForm = $('#form-sign-up');
  var msg= $('#form-sign-up #msg');
  var sha_pass = $('#form-sign-up #sha_pass');
  var password = $('#form-sign-up #password');
  var password1 = $('#form-sign-up #password1');
  msg.text('');
  if(password.val().length<6){
    msg.text('密码长度至少6位！');
    return;
  }
  if(password.val()!=password1.val()){
    msg.text('重复输入密码有误！');
    return;   
  }
  var shaObj = new jsSHA("SHA-512","TEXT");
  shaObj.update(password.val());
  sha_pass.val(shaObj.getHash("HEX"));
  $.ajax({
    url    : '/join',
    type   : 'post',
    data   : loginForm.serialize()
  }).done(function (data) {
    var info = data.join.msg;
    if(data.join.flag){
      info=info+'  '+data.login.msg;
    }
    msg.text(info);
    if(data.join.flag&&data.login.flag){
      window.setTimeout(function(){$('#sign-up').modal('hide');}, 1000);
    }
  }).fail(function (xhr, err, status) {
    msg.text(err);
    });
}

