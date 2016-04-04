var edit_mode = false;
var note_changed = false;
$(document).ready(function () {
	//Preview.Init('editor_preview','editor_buffer','editor_input'); 
	//Preview.Update();
  MathJax.Hub.Config({
  TeX: { equationNumbers: { autoNumber: "AMS" }
   }
  });
  /*
  MathJax.Hub.Register.MessageHook('End PreProcess',
  function (message) {console.log(message);});
  */
  display_note();
  $("#btnChangeNote").click(function() { toggle_change();});
  $("#btnSaveNote").click(function() { save_note();});
  $("#btnSaveNote").hide();
 });

function display_note(){
    $('#edit').toggle();
    $('#display').toggle();
    ExitEditor();
    $('#dis_title').html(notes[0].title);
    $('#dis_content').html(notes[0].content);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
    /*
    MathJax.Hub.Queue(
    ["resetEquationNumbers",MathJax.InputJax.TeX]
    //["PreProcess",MathJax.Hub]
    //["Reprocess",MathJax.Hub]
    );
    */
    if(note_changed){
      //$("#btnSaveNote").prop('disabled', false);
      $("#btnSaveNote").show();

    }
}

function toggle_change(){
  if(edit_mode){
    edit_mode = false;
    $("#btnChangeNote").text("修改");
    display_note();
    return;
  }
  edit_mode=true;
  $("#btnChangeNote").text("完成");
  change_note();

}

function change_note(){
  $('#display').toggle();
  $('#edit').toggle();
  $('#edit_title').html(notes[0].title);
  $('#edit_content').html(notes[0].content);
  InitEditor('edit_title','edit_content');

}
function save_note(){
    //notes[0].labels=JSON.stringify(['a','b','c','d']);
    notes[0].labels=['a','b','c','d'];
    $.ajax({
        url    : '/note?edit=note',
        type   : 'post',
        data   : JSON.stringify(notes[0]),
        contentType: 'application/JSON'

    }).done(function (data) {
        //console.log(data);
        //$('#msg').text(data.msg);
        alert(data.msg);
        if(data.flag){
          $("#btnSaveNote").hide();
          //$("#btnSaveNote").prop('disabled', true);
          note_changed=false;
        }

    }).fail(function (xhr, err, status) {
        //$('#msg').text(err);
        alert(data.msg);

    });
}

function check_save(){
  if(!note_changed){
    window.location='/note_book';
    return;
  }
  alert('You don not save the changes');
}

var Preview = {
  delay: 150,        // delay after keystroke before updating

  preview: null,     // filled in by Init below
  buffer: null,      // filled in by Init below
  input: null,

  timeout: null,     // store setTimout id
  mjRunning: false,  // true when MathJax is processing
  mjPending: false,  // true when a typeset has been queued
  oldText: null,     // used to check if an update is needed

  //
  //  Get the preview and buffer DIV's
  //
  Init: function (idPre,idBuf,idInp) {
    this.preview = document.getElementById(idPre);
    this.buffer = document.getElementById(idBuf);
    this.input  = document.getElementById(idInp);
  },

  //
  //  Switch the buffer and preview, and display the right one.
  //  (We use visibility:hidden rather than display:none since
  //  the results of running MathJax are more accurate that way.)
  //
  SwapBuffers: function () {
    var buffer = this.preview, preview = this.buffer;
    this.buffer = buffer; this.preview = preview;
    buffer.style.visibility = "hidden"; buffer.style.position = "absolute";
    preview.style.position = ""; preview.style.visibility = "";
  },

  //
  //  This gets called when a key is pressed in the textarea.
  //  We check if there is already a pending update and clear it if so.
  //  Then set up an update to occur after a small delay (so if more keys
  //    are pressed, the update won't occur until after there has been 
  //    a pause in the typing).
  //  The callback function is set up below, after the Preview object is set up.
  //
  Update: function () {
    if (this.timeout) {clearTimeout(this.timeout)}
    this.timeout = setTimeout(this.callback,this.delay);
  },

  //
  //  Creates the preview and runs MathJax on it.
  //  If MathJax is already trying to render the code, return
  //  If the text hasn't changed, return
  //  Otherwise, indicate that MathJax is running, and start the
  //    typesetting.  After it is done, call PreviewDone.
  //  
  CreatePreview: function () {
    Preview.timeout = null;
    if (this.mjPending) return;
    //var text = document.getElementById("MathInput").value;
    var text = this.input.value;
    if (text === this.oldtext) return;
    if (this.mjRunning) {
      this.mjPending = true;
      MathJax.Hub.Queue(["CreatePreview",this]);
    } else {
      this.buffer.innerHTML = this.oldtext = text;
      this.mjRunning = true;
      MathJax.Hub.Queue(
	["Typeset",MathJax.Hub,this.buffer],
	["PreviewDone",this]
      );
    }
  },

  //
  //  Indicate that MathJax is no longer running,
  //  and swap the buffers to show the results.
  //
  PreviewDone: function () {
    this.mjRunning = this.mjPending = false;
    this.SwapBuffers();
  }

};

//
//  Cache a callback to the CreatePreview action
//
Preview.callback = MathJax.Callback(["CreatePreview",Preview]);
Preview.callback.autoReset = true;  // make sure it can run more than once

