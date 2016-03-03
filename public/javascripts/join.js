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
    console.log(data);
    if ('exist' in data) {
      //localtion.href='/join';
      
    } else {
      //localtion.href='/users';
    }
  }).fail(function (xhr, err, status) {
      //localtion.href='/join';
  });
  //});
}

