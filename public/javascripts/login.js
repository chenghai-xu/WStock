$(document).ready(function () {
    initLogin();
 });

function initLogin(){
    var newMessageForm = $('#login');
    newMessageForm.submit(login);
    $('#log_status').hide();
}
function login(e){
  var loginForm = $('#login');
  var sha_pass = $('#sha_pass');
  var password = $('#password');
  var shaObj = new jsSHA("SHA-512","TEXT");
  shaObj.update(password.val());
  sha_pass.val(shaObj.getHash("HEX"));
  $.ajax({
    url    : '/login',
    type   : 'post',
    data   : loginForm.serialize()
  }).done(function (data) {
    $('#msg').text(data.login.msg);
    if(data.login.flag){
      window.location='/';
    }

  }).fail(function (xhr, err, status) {
      //localtion.href='/login';
  });

  //});
}
  
