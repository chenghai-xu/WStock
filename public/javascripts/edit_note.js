var content = null;
var title = null;
$(document).ready(function () {
});
function ExitEditor(){
    if(title == null || content == null){
        return;
    }
    notes[0].title = title.getData();
    notes[0].content = content.getData();
    title.setReadOnly(true);
    content.setReadOnly(true);

}

var ckeditor_config = {extraPlugins:'mathjax',
    //mathJaxLib:'http://cdn.mathjax.org/mathjax/2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML',
mathJaxLib:'/MathJax-2.6-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML',
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
};

function InitEditor(con_title,con_content)
{
    if(title != null && content != null)
    {
        title.setReadOnly(false);
        content.setReadOnly(false);  
        return;  
    }
    CKEDITOR.plugins.addExternal( 'mathjax', '/ckmathjax/','plugin.js' );
    content = CKEDITOR.replace(con_content,ckeditor_config);
    title = CKEDITOR.inline(con_title,ckeditor_config);

    if (CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) {
        document.getElementById( 'ie8-warning' ).className = 'tip alert';
    }     
    content.on('change',ckeditor_changed);
    title.on('change',ckeditor_changed);
}

function ckeditor_changed(evt)
{
    note_changed=true;
}

