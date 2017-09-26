
function getLatex (container){            
    var latex = $(container + ' .mathquill-editable').mathquill('latex');
    console.log(latex)
    //make sure we need to parse
    if($(container + ' .boxLatex').html() != latex){

        console.log('new shit')
        $(container + ' .boxLatex').html(latex);
        
        latex = parseLatex(latex);
        latex = prettyPrint(latex);
        
        $(container + ' .boxCode').html(latex[0]);
        
        var errOut = "";
        for(var i=0,len=errors.length;i<len;i++) errOut += errors[i]+"<br>";
        $(container + ' .boxErrors').html(errOut);
        errors.length = 0;
        
        
        $(container + ' .boxSemantic').html(latex[1]);
        
        var varsOut = "";
        for(var i=0,len=varList.length;i<len;i++) varsOut += "<div>"+varList[i]+"</div>";
        $(container + ' .boxVars').html(varsOut);
        varList.length = 0;
    }
}

function prettyPrint(latex){
    var sage="",color = "";
    for(var i=0,len=latex.length;i<len;i++){
        if(typeof latex[i][0] === 'array'){
            var inner = print(latex[i][0]);
            sage+=inner[0];
            color+="<div class=\'"+latex[i][1]+"\'>"+inner[1]+"</div>";
        }
        else{
            sage+=latex[i][0];
            color+="<div class=\'"+latex[i][1]+"\'>"+latex[i][0]+"</div>";
        }
    }
    return([sage,color]);
}

function makeTester(latex){
    boxes = $('myBox');
    num = boxes.length + 1;
    name = 'bed' + num;

    $('#bedroom').append(`<div id="`+ name + `" class="myBox">
        <span class="mathquill-editable">` + latex + `</span>
            <div class="boxLatex">latex goes here</div>
            <div class="boxCode">code goes here</div>
            <div class="boxSemantic">colors go here</div>
            <div class="boxErrors">errors go here</div>
            <div class="boxVars">vars go here</div>
        </div>`);

    name = '#'+name;

    jQuery(name + ' .mathquill-editable').mathquill('editable');

    window.setInterval(getLatex(name),100);  
    //$(name + ' .mathquill-editable').keypress(function(){
    //    getLatex(name)
    //});
}

$(document).ready(function(){
    makeTester('x \\cdot x');
});