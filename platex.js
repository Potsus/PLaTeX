        
        
//colored prototype: ["value","type","discription for user"]
//the discription is just for debug purposes.
//i can remove it for the final release
var colored = [];

//errors is just an array of strings.
//feel free to add whatever reporting you want
var errors = [];

//var list is an array with elements that look like:
//["variable name", "variable type"]
//that have been found in the latex and i've identified as variables
//they have a type if that variable has been set to a value previously
//this will help with error reporting and equation construction
var varList = [];

//the debug level.
//can be any positive integer
//i should have a place where you can set this going in
//that code goes in parse.js
var debug = 2;

//COPY FROM HERE DOWN TO THE END OF THIS SCRIPT

//might want to consider inserting times signs suring the latex parse
//might not be a bad idea, but would only work to the left and for much fewer cases
//this is more thorough

//consider having parse left and right be the top if
//have different class checks inside left and right ifs

//refrence sheet:
//the construction of a semantic object is as follows
//0 - the object's value
//1 - the object's semantic class, governs how this function deals with it
//2 - any notes about that particular 
function parseSemantic(semRep){
    var rep=0;
    err("Parse Semantic",rep);
    
    //loop is only for display purposes
    for(var j=0,len=semRep.length,cout="semRep: ";j<len;j++)cout += semRep[j][0]+" ";
    err(cout,rep);
    
    //set these three vars before each new step
    var parseLeft = 0;
    var parseRight = 1;
    var j=0; //the iterator
    
    //the first level parse
    //combines elements and creates functions where special chars are used
    err("The combining loop: combinations of elements and functions",rep);
    err("list length: "+semRep.length,rep);
    while(j<semRep.length){

        if(semRep[j-1]!=undefined)parseLeft = 1;
        else parseLeft = 0;
        if(semRep[j+1]==undefined)parseRight = 0;
        
        
        err("   CL at element "+j+" parse left:"+parseLeft+" parse right:"+parseRight,rep);
        err("current element: "+semRep[j],rep);
        
        
        switch(semRep[j][1]){
            case "num"://numbers
                err("       found a number",rep);
                //left
                if(parseLeft!=0){
                    err("        checking to the left",rep);
                    err("        nothing to do left",rep);
                }
                if(parseRight!=0){
                    err("        checking to the right",rep);
                    if(semRep[j+1][1]=="sup"){
                        //combine number and power
                        err("               combining the number:"+semRep[j][0]+" with power:"+semRep[j+1][0],rep);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"num","number and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else err("        found nothing right",rep);
                }
                j++;
                break;
                
            case "var"://variables
                err("       found a variable",rep);
                //left
                if(parseLeft!=0){
                    err("        checking to the left",rep);
                    err("        nothing to do left",rep);
                }
                if(parseRight!=0){
                    err("        checking to the right",rep);
                    if(semRep[j+1][1]=="sup"){
                        //the subscript gets combined first
                        if(semRep[j+2] != undefined){
                            if(semRep[j+2][1]=="sub"){
                                err("               combining the variable:"+semRep[j][0]+" with subscript:"+semRep[j+1][0],rep);
                                semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and subscript"];
                                semRep.splice(j+2,1);
                                break;
                            }
                        }
                        //combine var and power
                        err("               combining the variable:"+semRep[j][0]+" with power:"+semRep[j+1][0],rep);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else if(semRep[j+1][1]=="sub"){
                        //combine var and subscript
                        err("               combining the variable:"+semRep[j][0]+" with power:"+semRep[j+1][0],rep);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else if(semRep[j+1][1]=="paren"){
                        //combine var and paren to make function
                        
                        //lookup for variable function status goes here
                        
                        err("               combining the variable:"+semRep[j][0]+" with paren:"+semRep[j+1][0],rep);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","function"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else err("        found nothing right",rep);
                }
                j++;
                break;
                
            case "binOp"://binary operators
                err("       found a binary operator",rep);
                //left
                if(semRep[j][0]=="-"){
                    err("        binOp is minus. skipping check left",rep);
                }
                else{
                    if(parseLeft!=0){
                        err("        checking to the left",rep);
                        if(!needsBin(semRep[j-1][1]))console.error("     invalid left hand argument for binOp:"+semRep[j][0]);
                    }
                    else{
                        err("'" + semRep[j][0] + "' needs a left argument.",1);
                    }
                }
                if(semRep[j][0]=="-" || semRep[j][0]=="+"){
                    err("skip check right for + and -",rep);
                }
                else{
                    if(parseRight!=0){
                        err("        checking to the right",rep);
                        if(!needsBin(semRep[j+1][1])){
                            if(semRep[j+1][0]!="-"){
                                err("       binOp with invalid arguments on the right",1);
                            }
                        }
                    }
                    else{
                        err("'" + semRep[j][0] + "' needs a right argument.",1);
                    }
                }
                j++;
                break;
                
            case "comb"://combine
                var comb = semComb(semRep,j,recurse);
                semRep = comb[0];
                j = comb[1];
                break;
                
            case "prime":
                if(parseRight!=0){
                    err("        checking for additional primes",rep);
                    var recurse = 1;
                    while(semRep[j+1] != undefined && semRep[j+1][1] == "prime"){
                        recurse++;
                        semRep.splice(j+1,1);
                    }
                    var comb = semComb(semRep,j,recurse);
                    semRep = comb[0];
                    j = comb[1];
                    break;
                }
                else{
                    err("prime must be followed by the variable you are differentiating with respect to in parentheses",1);
                    j++;
                    break;
                }
                
            case "":
                semRep.splice(j,1);
                break;
                
            default: 
                j++;
                break;
        }
    }

    //the last level
    //inserts times signs
    parseLeft = 0;
    parseRight = 1;
    j=0;
    err("The last loop: inserting multipliers",rep);
    err("list length: "+semRep.length,rep);
    while(j<semRep.length){
        err("current element: "+semRep[j],rep);
        if(semRep[j-1]!=undefined)parseLeft = 1;
        else parseLeft = 0;
        if(semRep[j+1]==undefined)parseRight = 0;
        err("   LL at element "+j+" parse left:"+parseLeft+" parse right:"+parseRight,rep);
        //Number stuff
        if(needsBin(semRep[j][1])){
            err("    found a "+semRep[j][1],rep);
            //left
            if(parseLeft!=0){
                err("        checking to the left",rep);
                if(needsBin(semRep[j-1][1])){
                    err("            inserting a * between "+semRep[j-1][0]+" and "+semRep[j][0],rep);
                    semRep.splice(j,0,["*","binOp"]);
                    continue;
                }
            }
            if(parseRight!=0){
                err("        checking to the right",rep);
                if(needsBin(semRep[j+1][1])){
                    err("           inserting a * between "+semRep[j][0]+" and "+semRep[j+1][0],rep);
                    semRep.splice(j+1,0,["*","binOp"]);
                    continue;
                }
                else if(semRep[j+1][1]=="binOp"){
                    j++;
                    continue;
                }
            }
            j++;
        }
        if(parseLeft==0 && parseRight==0){
            err("can't parse left or right",rep);
            break;
        }
        else j++;
    }
    return semRep;
    
    function needsBin(sem){
        if(sem=="num" || sem=="func" || sem=="sym" || sem=="paren" || sem=="var") return true;
        else return false;
    }
}

//check if the variable is an array
//was going to be used for parse semantic to tell if i needed to recurse
//back when i was going to do vars mixed with strings
//keep it around for now
function isArray(val){return(val instanceof Array);}

function semComb(semRep,j,combVars){
    var list = [],rep=0;
    var instruct = matchWord(semRep[j][0],1);
    for(var k=0,len=instruct[0][3].length;k<len;k++){
        if(semRep[j+instruct[0][3][k]]!= undefined){
            err("adding the "+semRep[j+instruct[0][3][k]][1]+" "+semRep[j+instruct[0][3][k]][0]+" to the list",rep);
            if(instruct[0][5][k] == 1)
                switch(semRep[j+instruct[0][3][k]][1]){
                    case "paren":
                        //remove the parens
                        list[k] = semRep[j+instruct[0][3][k]][0].substring(1,semRep[j+instruct[0][3][k]][0].length-1);
                        break;
                    case "var":
                        //cut of the d for derivatives
                        list[k] = semRep[j+instruct[0][3][k]][0].substring(1);
                        break;
                    
                    default:
                        list[k] = semRep[j+instruct[0][3][k]][0];
                        break;
                }
            else list[k] = semRep[j+instruct[0][3][k]][0];
        }
        else{
            err("could not find an element at index "+j+instruct[0][3][k]+" relative to "+semRep[j][0]+" at index "+j,rep);
            break;
        }
    }
    //add the pre combination variables to the end of the list
    list = list.concat(combVars);
    //build the new semantic representation
    err("pattern: "+instruct[0][1],rep);
    semRep[j] = [parsePattern(instruct[0][1],list),instruct[0][2],"combined "+instruct[0][2]];
    for(var k=0,len=instruct[0][3].length;k<len;k++){
        err("removing "+semRep[j+instruct[0][3][k]][1]+" "+semRep[j+instruct[0][3][k]][1]+" at index "+j+instruct[0][3][k],rep);        
        semRep.splice(j+instruct[0][3][k],1);
        if(instruct[0][3][k]<0)j+=instruct[0][3][k];
    }
    return([semRep,j]);
}

function err(error,lev){
    
    //only push errors to the console if the debug level is greater than 1
    //and the error level is greater than zero
    //this lets us selectively report parts of the code
    if(debug>1){
        if(lev>0)console.error(error);
    }
    
    //push errors to the user at any debug level above 0
    //use level to switch weither it gets pushed to the user
    if(debug>0){
        if(lev>2)errors.push(error);
        else if(lev>1)warning.push(error);
    }
    
    return;
}


//might want to make the following tables into objects in the future 
//to make it easier to read and build new ones
//would make it easier to expand functionality as well
//i'm worried it could slow it down because of the way object indexing works
//FIX

//might want to make the following tables into objects in the future 
//to make it easier to read and build new ones
//would make it easier to expand functionality as well
//i'm worried it could slow it down because of the way object indexing works
//FIX

//the latex parsing function
//returns a fully parsed representation of the latex at the current recursion level
//should have special stuff for degree function replacements
//i don't want to deal with degrees right now
//combination of elements should occour after general parsing has taken place
//insertion of multiplication symbols happens after that
function parseLatex(latex){
    //REPORTING LEVEL
    var rep = 0;
    err("Parse Latex",rep);
    
    //semantic prototype: ["value","type","discription for user"]
    var semantic = [];
    var i = 0;
    while(i<latex.length){
        if(latex.charAt(i)=="\\"){
            err("   found a slash, reading word",rep);
            
            if(latex.substring(i,i+1) == "\\{"){
                inner = matchParen(latex.substring(i),"\\{",1);
                err("found a \\{",rep);
                i+=inner[1];
                semantic.push([inner[0],"curl"]);
            }
            else if(latex.substring(i,i+1) == "\\}"){
                err("lone right parenthese",1);
                i+2;
            }
            else{
                //move past the slash
                i++;                
            
                //skip over the words \left and \right
                if(latex.substring(i,i+4) == "left"){
                    i+=4;
                    err("ignored a \\left",rep);
                }
                else if(latex.substring(i,i+5) == "right"){
                    i+=5;
                    err("ignored a \\right",rep);
                }
                else{
                    var curWord = latex.charAt(i);
                    i++;
                    if(curWord.match(/[a-zA-Z]/)){
                        while(latex.charAt(i).match(/[a-zA-Z]/)){
                            curWord+=latex.charAt(i);
                            i++;
                        }
                        err("word length: "+curWord.length,rep);
                        
                        var instruct = matchWord(curWord);
                        if(instruct.length == 0){
                            semantic.push([curWord,"func"]);
                            err("Invalid or Unknown Syntax: "+curWord+".",1);
                        }
                        else{
                            semantic.push([instruct[0][1],instruct[0][3]]);
                            err("parsed a function: "+curWord+".",rep);
                        }
                    }
                    else{
                       err("invalid latex function: \"\\"+curWord+"\".",1);
                       i++;
                    } 
                }
            } 
        }
        else if(latex.charAt(i).match(/[a-zA-Z]/)){
            curWord = "";
            err("Found potential variable ",rep);
            while(latex.charAt(i).match(/[a-zA-Z]/)){
                curWord += latex.charAt(i);
                i++;
                err("current letter: "+latex.charAt(i-1)+" current word: "+curWord,rep);
            }
            err("pushing variable: "+curWord,rep)
            semantic.push([curWord,"var"]);
        }
        //    /^\d+\.?\d*$|^\.\d+$/                 makes for a great regex for this
        //    /^\d+$|^\.\d+$|^\d+\.\d+$|^\d+\.$/    works too but is a little unwieldly
        //    /^[0-9\.][0-9]*|[0-9]+\.[0-9]*$/      brian's regex
        //    /^[0-9\.][0-9]*$|^[0-9]+\.[0-9]*$/    needed a little fix
        else if(latex.charAt(i).match(/^\d$|^\.$/)){
            curWord = "";
            var dotCount = 0;
            while(latex.charAt(i).match(/^\d$|^\.$/)){
                if(latex.charAt(i) == "."){
                    if(dotCount <1){
                        dotCount++;
                        curWord += ".";
                        i++;
                        err("current digit: . current number: "+curWord,rep);
                    }
                    else break;
                }
                else if(latex.charAt(i).match(/^\d$/)){
                    curWord += latex.charAt(i);
                    err("current digit: "+latex.charAt(i)+" current number: "+curWord,1);
                    i++;
                }
            }
            while(curWord.length >1 && curWord.charAt(0)=="0" && curWord.charAt(1) != "."){
                curWord = curWord.substring(1);
                err("Numbers shouldn't have leading zeros. They've been removed... this time.",1);
            }
            err("   pushing whole number: "+curWord,rep);
            semantic.push([curWord,"num"]);
        }
        else if(latex.charAt(i)== " "){
            if(latex.length == 1){
                err("Empty field.",1);
            }
            i++;
        }
        else{
            //single character switch goes here
            err("   Single Char instruct: "+latex.charAt(i),rep);
            var instruct = matchWord(latex.charAt(i),2);
                switch(instruct[0][1]){
                    case "paren"://parenthese character
                        err("Parenthese: \""+instruct[0][0]+"\".",rep);
                        var inner = matchParen(latex.substring(i, latex.length),instruct[0][0]);
                        semantic.push([inner[0],instruct[0][1]]);
                        i+= inner[1];
                        break;
                    case "sub"://unknown character
                        err("Unknown character \""+instruct[0][0]+"\".",rep);
                        semantic.push([instruct[0][0],instruct[0][2]]);
                        i+= inner[1];
                        break;
                    case "sup"://unknown character
                        err("Unknown character \""+instruct[0][0]+"\".",rep);
                        semantic.push([instruct[0][0],instruct[0][2]]);
                        i+= inner[1];
                        break;
                    case "err"://unknown character
                        err("Unknown character \""+instruct[0][0]+"\".",rep);
                        semantic.push([instruct[0][0],instruct[0][2]]);
                        i+= inner[1];
                        break;
                    default:
                        //the default case
                        errors.push("Unknown charactor type: '"+instruct[0][0]+"'.");
                        semantic.push([instruct[0][1],instruct[0][3]]);
                        i++;
                        break;
                }
        }
    }
    var sageCode = "";
    
    //SEMANTIC PARSE
    //if(semantic.length >1)semantic = parseSemantic(semantic);
    
    err("finished sage code: "+sageCode,rep);
    err("",rep);
    return semantic;
}



//var lookup function
function varLookUp(word,test){
    console.log("runnung varLookUp on "+word);
    for(var j=0,len2=varList.length;j<len2;j++){
        console.log(varList[j]);
        if(varList[j][0] == word){
            if(test != undefined){
                if(varList[j][1] == test)return true;
                else return false;
            }
            return(varList[j]);
        }
    }
    return false;
}



//the flag just tells the function weither to parse the contents of the parentheses or not
function matchParen(substr,type){ 
    var rep = 0;
    err("matchParen",rep);
    var parenTypes = [
        //standard parentheses for sage
        ["\\left(","\\right)","paren"],
        ["(",")","paren"],
        
        //sage dictionary parens
        ["\\left\\{","\\right\\}","curl"],
        ["\\{","\\}","curl"],
        ["{","}","curl"],
        
        //sage set parens
        ["\\left[","\\right]","brac"],
        ["[","]","brac"],
        
        //absolute value parens
        ["|","|","abs",1],
        ["\\left|","\\right|","abs",1],
        ["lvert","rvert","abs",1],
        ["\\lvert","\\rvert","abs",1],
        ["left\\lvert","right\\rvert","abs",1],
        
        
        //not sure how sage should handle these yet
        
        //says its used for angles 
        //as in a function called angles()
        ["left\\langle","right\\rangle","angles(",")"],
        ["\\langle","\\rangle","angles(",")"],
        ["langle","rangle","angles(",")"],
        
        //cieling parens 
        //used with ciel()
        ["\\lceil","\\rceil","ceil(",")"],
        ["left\\lceil","right\\rceil","ceil(",")"],
        ["lceil","rceil","ceil(",")"],
        
        //floor parens 
        //used with floor()
        ["left\\lfloor","right\\rfloor","floor(",")"],
        ["\\lfloor","\\rfloor","floor(",")"],
        ["lfloor","rfloor","floor(",")"],
        
        //double pipes 
        //supposedly used with a func norm()
        ["left\\Lvert","right\\Rvert","norm(",")"],
        ["\\Lvert","\\Rvert","norm(",")"],
        ["Lvert","Rvert","norm(",")"],

    ];
    
    err("lookup paren type: "+type,rep);
    var parenSet = "", out=[];
    for(var j=0,len=parenTypes.length;j<len;j++){
        if(parenTypes[j][0]==type){
            err("    mached to paren type: "+parenTypes[j],rep);
            parenSet=parenTypes[j];
            break;
        }
    }
    if(parenSet == ""){
        err("Unknown parentheses type: '"+type+"'.",1);
        return([parseLatex(substr.substring(type.length,substr.length)),substr.length]);
    }

    err("    match paren type: "+parenSet[0]+" "+parenSet[1]+" on substring: "+substr,rep);
    //missing starting left paren
    if(substr.substring(0,parenSet[0].length) != parenSet[0]){
        err("Left "+ parenthName[parenSet[0]] + " is missing.",1);
        return([[],0]);
    }

    var left = 0, right = 0, i = 0;
    while(i<=substr.length){
        if(right == left && i>1){
            err("parsing inner substring: "+substr.substring(parenSet[0].length,i-parenSet[1].length),rep);
            return([parseLatex(substr.substring(parenSet[0].length,i-parenSet[1].length)),i]);
        }
        else{
            err("left: "+left+" right: "+right+" remaining string: "+substr.substring(i),rep);
            err("match: "+substr.substring(i,i+parenSet[1].length)+" == "+parenSet[0]+" or "+parenSet[1],rep);
            if(substr.substring(i,i+parenSet[0].length) == parenSet[0]){
                left++;
                i+=parenSet[0].length;
                err("    matched a left paren",rep);
            }
            else if(substr.substring(i,i+parenSet[1].length) == parenSet[1]){
                right++;
                i+=parenSet[1].length;
                err("    matched a right paren",rep);
            }
            else i++;
        }
    }
    err("right paren: "+parenSet[1]+" is missing.",1);
    return([parseLatex(substr.substring(parenSet[0].length)),substr.length]);
}



//takes a pattern that variables should be inserted into
//inserts the variable with an index matching that of variables in the pattern
//variable locations look like \\1 
//where 1 is the index of the variable we want to insert
function parsePattern(pattern,vars){
    var rep=0;
    err("parsePattern",rep);
    err("    parsing pattern: "+pattern+" with vars: "+vars,rep);
    var sageCode = "";
    var j = 0;
    while(j < pattern.length){
        if(pattern.charAt(j) == "\\"){
            err("        found a variable",1);
            var curVar = "";
            j++;
            while(pattern.charAt(j).match(/[0-9]/)){
                curVar += pattern.charAt(j);
                j++;
            }
            err("        variable: "+curVar+" inserting: "+vars[curVar],rep);
            sageCode+=vars[curVar];
        }
        sageCode+=pattern.charAt(j);
        err("    output: "+sageCode,rep);
        j++;
    }
    return(sageCode);
}



//does lookups on words in the same way as charMatch 
function matchWord(curWord, table){
    var rep = 0;
    err("matchWord",rep);
    //table for elements that combine with those arround them in a distinct way
    //[element, pattern, type after parse, relative location of elements, expected element type]
    //going to hold of on the expected type for now
    var combTable = [
        ["!","factorial(\\0)","func",[-1],[["var","num","func","paren"]],[0]],
        ["\'","derivative(\\0(\\1),\\1,\\2)","func",[-1,1],[["var"],["paren"]],[0,1]],
        ["int","integrate\\2,\\3,\\0,\\1)","func",[1,2,3,4],[["sup","sub"],["sup","sub"],["paren"],"var"],[0,0,1,1]],
    ]
    
    //char prototype:
    //["char", "semantic name"
    var charTable = [
        ["{","paren"],
        ["{","paren"],
        ["}","paren"],
        ["}","paren"],
        [")","paren"],
        ["(","paren"],
        ["[","paren"],
        ["]","paren"],
        ["|","func"],
        ["^","sup"],
        ["_","sub"],
        ["+","binOp"],
        ["-","binOp"],
        ["*","binOp"],
        ["/","binOp"],
        ["=","equiv"],
        ["<","comp"],
        [">","comp"],
        ["!","comb"],
        ["\'","prime"],
        [",","sageS"],
        [":","sageS"],
        ["\"","sageS"],
        [" ","space"],
    ];
    
    //for symbols and functions longer than one character
    //
    //parseTable = ["LATEX after \","SAGE pattern",switch flag,semantic val,number of vars(i'll probably get rid of this)]
    //
    //switches 
    //0 - binary operators, +-/* and symbols
    //1 - parentheses
    //2 - functions that require paren following them
    //3 - functions with values in curly braces
    //4 - bounded functions
    //5 - sum function, should be replaced with bounded func
    //
    //patterns
    //variables denoted by two backslashes \\ and a number like \\2
    var funcTable = [
        //trigonometric functions
        //sine
        ["sin","sin",7,"func"],
        ["arcsin","arcsin",7,"func"],
        ["sinh","sinh",7,"func"],
        
        //cosine
        ["cos","cos",7,"func"],
        ["arccos","arccos",7,"func"],
        ["cosh","cosh",7,"func"],
        
        //tangent
        ["tan","tan",7,"func"],
        ["arctan","arctan",7,"func"],
        ["tanh","tanh",7,"func"],
        
        //cotangent
        ["cot","cot",7,"func"],
        ["arccot","arccot",7,"func"],
        ["coth","coth",7,"func"],
        
        //cosecant
        ["csc","csc",7,"func"],
        ["arccsc","arccsc",7,"func"],
        ["csch","csch",7,"func"],
        
        //secant
        ["sec","sec",7,"func"],
        ["arcsec","arcsec",7,"func"],
        ["sech","sech",7,"func"],
        
        //log functions
        //soon to be functions with default values
        ["lg","log(\\2,\\0)",8,"func","10"],
        ["ln","log(\\2,\\0)",8,"func","e"],
        ["log","log(\\2,\\0)",8,"func","10"],
        ["lb","log(\\2,\\0)",8,"func","2"],
        
        
        //misc functions
        //
        //greatest common denominator
        ["gcd","gcd",2,"func"],
        
        //kernel. used on matricies
        ["ker","ker",2,"func"],
        
        //determinant. used on matrices
        ["det","det",2,"func"],
        
        //limit. gotta get this one done
        ["lim","limit(\\3, \\0====\\1 \\2)",9,"func"],
        
        //argument. used in discrete
        ["arg","arg",2,"func"],
         
        ["frac","((\\0)/(\\1))",11,"paren",2],
        
        //square root and nth root
        ["sqrt","sqrt(\\0)",6,"func",1],
        
        //height matched parens
        ["left(","(",1,"paren"],
        ["right)","(",1,"paren"],
        
        ["left[","[",1,"paren"],
        ["right]","]",1,"paren"],
        
        ["left\\{","{",1,"paren"],
        ["right\\}","}",1,"paren"],
        
        ["left|","abs(",1,"paren"],
        ["right|",")",1,"paren"],
        
        ["left\\langle","<",1,"paren"],
        ["right\\rangle",">",1,"paren"],
        
        ["left\\lceil","ceil(",1,"func"],
        ["right\\rciel",")",1,"func"],
        
        ["left\\lfloor","floor(",1,"func"],
        ["right\\rfloor",")",1,"func"],
        
        ["left\\lvert","|",1,"paren"],
        ["right\\rvert","(",1,"paren"],
        
        ["left\\Lvert","|",1,"paren"],
        ["right\\Rvert","(",1,"paren"],
        
        //binary operators
        ["cdot","*",0,"binOp"],
        [",","*",0,"binOp"],
        ["ast","*",0,"binOp"],
        ["star","*",0,"binOp"],
        ["times","*",0,"binOp"],
        ["div","/",0,"binOp"],
        ["mod","%",0,"binOp"],
        
        //text fields
        ["textbf","\\0",3,"func",1],
        ["textit","\\0",3,"func",1],
        ["text","\\0",3,"var",1],
        
        //big greek notations
        //["int","integrate(\\0,\\1,\\2,\\3)",4,"func"],
        ["int","integrate(\\0,\\1,\\2,\\3)",0,"comb"],
        ["sum","sum(\\3,\\2,\\1,\\0)",5,"func"],
        ["prod","product(\\3,\\2,\\1,\\0)",5,"func"],
        
        //equivalence operators
        ["leq","<=", 0, "equiv"],
        ["le","<=", 0, "equiv"],
        ["geq",">=", 0, "equiv"],
        ["ge",">=", 0, "equiv"],
        ["neq","!=", 0, "equiv"],
        ["ne","!=", 0, "equiv"],
        
        //Logic connectives
        
            //AND : the conjunction
        ["and"," and ", 0, "bool"],
        ["land"," and ", 0, "bool"],
        ["wedge"," and ", 0, "bool"],
        
            //OR : the disjunction
        ["or"," or ", 0, "bool"],
        ["lor"," or ", 0, "bool"],
        ["vee"," or ", 0, "bool"],
        
            //NOT : the negation
        ["not"," not ", 0, "bool"],
        ["lnot"," not ", 0, "bool"],
        ["neg"," not ", 0, "bool"],
        
            //IFF : if and only if
        ["iff"," iff ", 0, "bool"],
        ["iff"," iff ", 0, "bool"],
        
            //XOR : exclusive or
        ["oplus","",-1,"binOp"],
        
            /*THEN : if then 
        ["leftarrow","lar",,"sym"],
        ["Leftarrow","lar",,"sym"],
        
        */
        //symbols
        ["backslash","//", -2, "sym"],
        ["infty","oo",0,"sym"],
        ["partial","d ",0,"der"],
        
        //arrows
        ["from","lar",0,"arr"],
        ["leftarrow","lar",0,"arr"],
        ["Leftarrow","Lar",0,"arr"],
        
        ["to","rar",0,"arr"],
        ["rightarrow","rar",0,"arr"],
        ["Rightarrow","Rar",0,"arr"],
        
        ["mapsto","map to",0,"arr"],
        
        //symbols i need to find the sage equivalent of
            //i think these are just other forms of bin ops
        
        ["ominus","",-1,"binOp"],
        ["odot","",-1,"binOp"],
        ["otimes","",-1,"binOp"],
        
        ["oslash","",-1,"sym"],
        
            //these are set operators for discrete
        ["cup","",-1,"binOp"],
        ["union","",-1,"binOp"],
        ["bigcup","",-1,"binOp"],
        
        ["cap","",-1,"binOp"],
        ["inter","",-1,"binOp"],
        
        ["bigcap","",-1,"binOp"],
        ["biguplus","",-1,"binOp"],
        
            //an upside down delta?
        ["nabla","grad",2,"func"],
        
            //big function letters
        ["coprod","",-1,"func"],
        ["intO","",-1,"func"],
        ["intOe","",-1,"func"],
        ["intG","",-1,"func"],
        ["intGh","",-1,"func"],
        ["intGhe","",-1,"func"],
        ["oint","",-1,"func"],
        ["iint","",-1,"func"],
        ["iiint","",-1,"func"],
        ["idotsint","",-1,"func"],
        
            //common dirivative letters
        ["dx","",-1,"sym"],
        ["dy","",-1,"sym"],
        ["dz","",-1,"sym"],
        ["dr","",-1,"sym"],
        ["dt","",-1,"sym"],
        ["dO","",-1,"sym"],
        ["dG","",-1,"sym"],
        ["dT","",-1,"sym"],
        
            //delta with letters
        ["del f","",-1,"sym"],
        ["grad f","",-1,"sym"],
        ["divr f","",-1,"sym"],
        ["curl f","",-1,"sym"],
        ["p f","",-1,"sym"],
        
        //greek letters
        ["pi","pi", 0, "sym"],
        ["varpi","pi", 0, "sym"],
        ["alpha","alpha", 0, "sym"],
        ["beta","beta", 0, "sym"],
        ["chi","chi", 0, "sym"],
        ["delta","delta", 0, "sym"],
        ["Delta","Delta", 0, "sym"],
        ["epsilon","epsilon", 0, "sym"],
        ["Epsilon","Epsilon", 0, "sym"],
        ["varepsilon","epsilon", 0, "sym"],
        ["eta","eta", 0, "sym"],
        ["gamma","gamma", 0, "sym"],
        ["Gamma","Gamma", 2, "func"],
        ["digamma","digamma", 0, "sym"],
        ["iota","iota", 0, "sym"],
        ["kappa","kappa", 0, "sym"],
        ["lambda","varlambda", 0, "sym"],
        ["Lambda","Lambda", 0, "sym"],
        ["mu","mu", 0, "sym"],
        ["nu","nu", 0, "sym"],
        ["omega","omega", 0, "sym"],
        ["Omega","Omega", 0, "sym"],
        ["phi","phi", 0, "sym"],
        ["Phi","Phi", 0, "sym"],
        ["varphi","phi", 0, "sym"],
        ["psi","psi", 2, "func"],
        ["Psi","Psi", 0, "sym"],
        ["rho","rho", 0, "sym"],
        ["varrho","rho", 0, "sym"],
        ["sigma","sigma", 2, "func"],
        ["Sigma","Sigma", 0, "sym"],
        ["tau","tau", 0, "sym"],
        ["theta","theta", 0, "sym"],
        ["Theta","Theta", 0, "sym"],
        ["vartheta","theta", 0, "sym"],
        ["upsilon","upsilon", 0, "sym"],
        ["Upsilon","Upsilon", 0, "sym"],
        ["xi","xi", 0, "sym"],
        ["Xi","Xi", 0, "sym"],
        
        //hebrew symbols
        ["zeta","zeta", 0, "sym"],
        ["aleph","aleph", 0, "sym"],
        ["beth","beth", 0, "sym"],
        ["gimel","gimel", 0, "sym"],
        ["daleth","daleth", 0, "sym"],
        
        //empty set and none symbols
        ["varnone","None", 0, "sym"],
        ["varnothing","None", 0, "sym"],
        
        //space characters
        ["s","", 10, ""],
    ];

    err("matchWord",rep);
    var curDict = new Array;
    var dispDict = new Array;
    var parseTable = [];
    
    //i should find a better way of doing this
    //this is copying a huge list which is a waste of memory,
    //but it allows for one lookup code to be used
    //fuck javascript for not allowing reference pointers
    //reference pointers would have been awesome for most of this program 
    //
    switch(table){
        case 0:
            parseTable = funcTable;
            break;
        case 1:
            parseTable = combTable;
            break;
        case 2:
            parseTable = charTable;
            break;
        default:
            parseTable = funcTable;
            break;
    }
    //get any commands of the same length
    for(var j=0,len=parseTable.length; j<len; j++){
        if(parseTable[j][0].length == curWord.length){
            curDict.push(parseTable[j]);
            dispDict.push(parseTable[j][0]);
        }  
    }

    if(curDict.length == 0){
        if(curWord.length > 0) err("Unknown function: '"+curWord+"'.",1);
        return([[curWord,"err","err","err"]]);
    }
    err("   Length matches: "+dispDict,rep);

    //narrow the list each letter
    var k = 0;
    while(curDict.length > 1 && curWord.length > k){
        var newDict = new Array;
        dispDict.length = 0;
        //make a new array of the valid commands because i don't feel like splicing or popping.
        //i'll probably do that in the future cause speed/memory
        for(var l=0,len=curDict.length; l<len;l++){
            if(curDict[l][0].charAt(k) === curWord.charAt(k)){
                newDict.push(curDict[l]);
                dispDict.push(curDict[l][0]);
            }
        }
        curDict = newDict;
        err("   Letter matches: "+dispDict,rep);
        k++;
    }

    if(curDict.length != 0){
        if(curDict[0][0] == curWord){
            err("word instructions: "+curDict[0],rep);
            return curDict;
        }
        else{
            err("unknown  function word: "+curWord,1);
            return([[curWord,curWord,"-1","err"]]);
        }
    }
    else{
        err("unknown  function word: "+curWord,1);
        return([[curWord,curWord,"-1","err"]]);
    }
}   

        