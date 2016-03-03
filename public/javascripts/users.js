$(document).ready(function () {
    initLogin();
 });

function initLogin(){
    var newMessageForm = $('#main section.new form');
    newMessageForm.submit(login(e));
}
function login(e){
  var loginForm = $('#login');
    $.ajax({
      url    : '/users',
      method : 'post',
      data   : loginForm.serialize()
    }).done(function (data) {

      if ('errors' in data) {
        alert("Some thing wrong.");
      } else {
        alert("Success.");
      }
    }).fail(function (xhr, err, status) {
      alert('error', xhr.status + ', ' + xhr.responseText);
    });
  //});
}

