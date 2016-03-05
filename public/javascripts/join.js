$(document).ready(function () {
    initLogin();
 });

function initLogin(){
    var newMessageForm = $('#join');
    newMessageForm.submit(join);
    $('#log_status').hide();
}
function join(e){
  var loginForm = $('#join');
  var sha_pass = $('#sha_pass');
  var password = $('#password');
  var shaObj = new jsSHA("SHA-512","TEXT");
  shaObj.update(password.val());
  sha_pass.val(shaObj.getHash("HEX"));
  $.ajax({
    url    : '/join',
    type   : 'post',
    data   : loginForm.serialize()
  }).done(function (data) {
    var msg = data.join.msg;
    if(data.join.flag){msg=msg+'.  '+data.login.msg;}
    $('#msg').text(msg);

  }).fail(function (xhr, err, status) {
      //localtion.href='/join';
  });
  //});
}

