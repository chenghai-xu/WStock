$(document).ready(function () {
    CKEDITOR.replace('editor_input',
        {extraPlugins:'mthjax,mathjax,widget,lineutils,dialog,clipboard',
            mathJaxLib:'/MathJax-2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML'
            //mathJaxClass:'equation'
        });
    if (CKEDITOR.env.ie && CKEDITOR.env.version == 8 ) {
        document.getElementById( 'ie8-warning' ).className = 'tip alert';
    }     
    /*
    var head = CKEDITOR.instances.metas.document.getHead();
    var script = CKEDITOR.dom.element.createFromHtml( '<script type="text/javascript" src="/MathJax-2.5-latest/MathJax.js?config=TeX-MML-AM_HTMLorMML"></script>' );
    head.append( script );
    */

    /*
    $('#editControls a').click(function(e) {
        switch($(this).data('role')) {
            case 'h1':
            case 'h2':
            case 'p':
                document.execCommand('formatBlock', false, '<' + $(this).data('role') + '>');
                break;
            //case 'MathJax':
                //document.execCommand('FormatBlock', false, 'p');
                //MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                //break;
            case 'save':
                alert('Not support now.')
                break;
            case 'export':
                alert('Not support now.')
                break;
            default:
                document.execCommand($(this).data('role'), false, null);
                break;

        }

    });
    MathJax.Hub.Register.MessageHook("New Math",function (message) {
        //  do something with the error.  message[2] is the Error object that records the problem.
        $('#msg').text(message[1]);
    });
    */

});

function MathInsert()
{
    $('#note_content').insertAtCaret($('#MathInput').val());
}
