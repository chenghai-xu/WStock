var content = null;
var title = null;
$(document).ready(function () {
    CKEDITOR.plugins.addExternal( 'mathjax', '/ckmathjax/','plugin.js' );
    var content = CKEDITOR.replace('content',
        //{extraPlugins:'mathjax,widget,lineutils,dialog,clipboard',
        {extraPlugins:'mathjax',
            mathJaxLib:'http://cdn.mathjax.org/mathjax/2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML',
        //mathJaxLib:'/MathJax-2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML'
        //mathJaxClass:'equation'
        removePlugins:'pagebreak,templates,bidi,div,blockquote,iframe,forms,newpage,smiley',
        toolbarGroups:[
                { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
                { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
                { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
                { name: 'forms', groups: [ 'forms' ] },
                { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
                { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
                { name: 'links', groups: [ 'links' ] },
                { name: 'insert', groups: [ 'insert' ] },
                { name: 'styles', groups: [ 'styles' ] },
                { name: 'colors', groups: [ 'colors' ] },
                { name: 'tools', groups: [ 'tools' ] },
                { name: 'about', groups: [ 'about' ] },
                '/',
                        { name: 'others', groups: [ 'others' ] }
        ]
        });
    if (CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) {
        document.getElementById( 'ie8-warning' ).className = 'tip alert';
    }     
    content.on('save',save);
    title = CKEDITOR.inline('title');
    //alert(CKEDITOR.plugins.loaded);
    //console.log('loaded plugins: ',CKEDITOR.plugins.loaded);
    //console.log('registered plugins: ',CKEDITOR.plugins.registered);

});

function MathInsert()
{
    $('#note_content').insertAtCaret($('#MathInput').val());
}
function save(evt)
{
    var note={title:title.getData(),
    content:evt.editor.getData()};
    console.log(note);
    $.ajax({
        url    : '/edit_note',
        type   : 'post',
        data   : note
    }).done(function (data) {
        //console.log(data);
        $('#msg').text(data.msg);
        if(data.flag){
            //window.location='/';
        }

    }).fail(function (xhr, err, status) {
        //localtion.href='/login';
    });

    return false;
}
