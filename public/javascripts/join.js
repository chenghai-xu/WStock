$(document).ready(function () {
  initLogin();
});

function initLogin(){
  var newMessageForm = $('#join');
  newMessageForm.submit(join);
  $('#log_status').hide();
}
function join(e){
  var msg= $('#msg');
  var loginForm = $('#join');
  var sha_pass = $('#sha_pass');
  var password = $('#password');
  var password1 = $('#password1');
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
      window.location='/';
    }
  }).fail(function (xhr, err, status) {
    msg.text(err);
    });
}

