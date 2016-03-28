$(document).ready(function () {
  display_notes();
    $("#btnCreateNote").click(function() { create_note();});
 });

function create_note(){
    var note = {};
    note.title = 'Math';
    note.content = 'Math: When \\(a \\ne 0\\), there are two solutions to \\(ax^2 + bx + c = 0\\) and they are \\[x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\\]';

    $.ajax({
        url    : '/note_book',
        type   : 'post',
        data   : note
    }).done(function (data) {
        //console.log(data);
        $('#msg').text(data.msg);
        if(data.flag){
            note.uid = data.notes[0].uid;
            note.created = data.notes[0].created;
            note.updated = data.notes[0].updated;
            notes.unshift(note);
            display_note($('#notes_list'),note,false);
        }

    }).fail(function (xhr, err, status) {
        $('#msg').text(err);
    });
}

function display_notes()
{
    var contain = $('#notes_list');
    for(var i=0; i < notes.length;i++){
      display_note(contain,notes[i],true);
    }
}
function display_note(parent,data,append){
      $(".templateItem").attr('href','/note?uid='+data.uid);
      $(".templateItem #title").html(data.title);
      $(".templateItem #created").text(data.created.toLocaleString());
      //$(".templateItem>#updated").text(data.updated);
      //$(".templateItem #abstract").html(data.title);
      $(".templateItem #abstract").text("tag: "+data.labels.join(' '));
      var note = $(".templateItem").clone();
      note.removeClass("templateItem");
      if(append){
        parent.append(note);  
      }
      else{
        parent.prepend(note);
      }
      note.show(); 
      $(".templateItem").hide();
}
