//http://en.wikipedia.org/wiki/List_of_mathematical_symbols        

//it's going to make it a lot easier to understand
//
//use objects for data but arrays for fast lookups
//
//fuck no i was right
//arrays are dozen's to hundreds of times faster than objects
//objects are more extensible however...
//objects might be better for the kind of analasys that i'm working on, albiet vastly slower
//
//objects would be much better for what i'm talking about
//rather than defining complicated loops i could define a general object with a parse method and attributes
//after i've assigned semantic values to the latex i could iterate through and call their parse methods
//this would generally involve searching the semantic representation and stealing values and marking things as used
//
//methods:
//get contents
//parse
//mark used
//
//objects are too slow so i'll be using switch statements with code for 
//
//i can still use arrays for indexes and keep it fast that way
//arrays should also be used for the key since it's much faster there
//
//splicing into the middle of an array is slow as shit
//http://stackoverflow.com/questions/8423493/what-is-the-performance-of-objects-arrays-in-javascript-specifically-for-googl
//
//a little note, 
//apparently while loops are much faster in reverse
//



//refrence sheet:
//the construction of a semantic object is as follows
//0 - the object's value
//1 - the object's semantic class, governs how this function deals with it
//2 - any notes about that particular 
function parseSemantic(semRep){
    console.log("Parse Semantic");

    //loop is only for display purposes
    for(var j=0,len=semRep.length,cout="semRep: ";j<len;j++)cout += semRep[j][0]+" ";
    console.log(cout);

    //set these three vars before each new step
    var parseLeft = 0;
    var parseRight = 1;
    var j=0; //the iterator

    //the first level parse
    //combines elements and creates functions where special chars are used
    console.log("The combining loop: combinations of elements and functions");
    console.log("list length: "+semRep.length);
    while(j<semRep.length){

        if(semRep[j-1]!=undefined)parseLeft = 1;
        else parseLeft = 0;
        if(semRep[j+1]==undefined)parseRight = 0;


        console.log("   CL at element "+j+" parse left:"+parseLeft+" parse right:"+parseRight);
        console.log("current element: "+semRep[j]);


        switch(semRep[j][1]){
            case "num"://numbers
                console.log("       found a number");
                //left
                if(parseLeft!=0){
                    console.log("        checking to the left");
                    console.log("        nothing to do left");
                }
                if(parseRight!=0){
                    console.log("        checking to the right");
                    if(semRep[j+1][1]=="sup"){
                        //combine number and power
                        console.log("               combining the number:"+semRep[j][0]+" with power:"+semRep[j+1][0]);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"num","number and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else console.log("        found nothing right");
                }
                j++;
                break;

            case "var"://variables
                console.log("       found a variable");
                //left
                if(parseLeft!=0){
                    console.log("        checking to the left");
                    console.log("        nothing to do left");
                }
                if(parseRight!=0){
                    console.log("        checking to the right");
                    if(semRep[j+1][1]=="sup"){
                        //the subscript gets combined first
                        if(semRep[j+2] != undefined){
                            if(semRep[j+2][1]=="sub"){
                                console.log("               combining the variable:"+semRep[j][0]+" with subscript:"+semRep[j+1][0]);
                                semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and subscript"];
                                semRep.splice(j+2,1);
                                break;
                            }
                        }
                        //combine var and power
                        console.log("               combining the variable:"+semRep[j][0]+" with power:"+semRep[j+1][0]);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else if(semRep[j+1][1]=="sub"){
                        //combine var and subscript
                        console.log("               combining the variable:"+semRep[j][0]+" with power:"+semRep[j+1][0]);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","variable and power"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else if(semRep[j+1][1]=="paren"){
                        //combine var and paren to make function

                        //lookup for variable function status goes here

                        console.log("               combining the variable:"+semRep[j][0]+" with paren:"+semRep[j+1][0]);
                        semRep[j] = [(semRep[j][0] + semRep[j+1][0]),"var","function"];
                        semRep.splice(j+1,1);
                        break;
                    }
                    else console.log("        found nothing right");
                }
                j++;
                break;

            case "binOp"://binary operators
                console.log("       found a binary operator");
                //left
                if(semRep[j][0]=="-"){
                    console.log("        binOp is minus. skipping check left");
                }
                else{
                    if(parseLeft!=0){
                        console.log("        checking to the left");
                        if(!needsBin(semRep[j-1][1]))console.error("     invalid left hand argument for binOp:"+semRep[j][0]);
                    }
                    else{
                        console.error("       binOp with nothing on the left");
                        errors.push("'" + semRep[j][0] + "' needs a left argument.");
                    }
                }
                if(semRep[j][0]=="-" || semRep[j][0]=="+"){
                    console.log("skip check right for + and -");
                }
                else{
                    if(parseRight!=0){
                        console.log("        checking to the right");
                        if(!needsBin(semRep[j+1][1])){
                            if(semRep[j+1][0]!="-"){
                                console.error("       binOp with invalid arguments on the right");
                                errors.push("'" + semRep[j][0] + "' has an invalid right arguments.");
                            }
                        }
                    }
                    else{
                        errors.push("'" + semRep[j][0] + "' needs a right argument.");
                        console.error("'" + semRep[j][0] + "' needs a right argument.");
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
                    console.log("        checking for additional primes");
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
                    console.error("prime must be followed by the variable you are differentiating with respect to in parentheses");
                    errors.push("The prime must be followed by the variable you are differentiating with respect to in parentheses.");
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
    console.log("The last loop: inserting multipliers");
    console.log("list length: "+semRep.length);
    while(j<semRep.length){
        console.log("current element: "+semRep[j]);
        if(semRep[j-1]!=undefined)parseLeft = 1;
        else parseLeft = 0;

        console.log('checking ro the right: '+semRep[j+1]);
        if(semRep[j+1]==undefined)parseRight = 0;
        console.log("   LL at element "+j+" parse left:"+parseLeft+" parse right:"+parseRight);
        //Number stuff
        if(needsBin(semRep[j][1])){
            console.log("    found a "+semRep[j][1]);
            //left
            if(parseLeft!=0){
                console.log("        checking to the left");
                if(needsBin(semRep[j-1][1])){
                    console.log("            inserting a * between "+semRep[j-1][0]+" and "+semRep[j][0]);
                    semRep.splice(j,0,["*","binOp","inserted multiplier"]);
                    continue;
                }
            }
            if(parseRight!=0){
                console.log("        checking to the right");
                if(needsBin(semRep[j+1][1])){
                    console.log("           inserting a * between "+semRep[j][0]+" and "+semRep[j+1][0]);
                    semRep.splice(j+1,0,["*","binOp","inserted multiplier"]);
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
            console.log("can't parse left or right");
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
    var list = [];
    var instruct = matchWord(semRep[j][0],1);
    for(var k=0,len=instruct[0][3].length;k<len;k++){
        if(semRep[j+instruct[0][3][k]]!= undefined){
            console.log("adding the "+semRep[j+instruct[0][3][k]][1]+" "+semRep[j+instruct[0][3][k]][0]+" to the list");
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
            console.error("could not find an element at index "+j+instruct[0][3][k]+" relative to "+semRep[j][0]+" at index "+j);
            errors.push("Could not find an element at index "+j+instruct[0][3][k]+" relative to "+semRep[j][0]+"."); // at index "+j);
            break;
        }
    }
    //add the pre combination variables to the end of the list
    list = list.concat(combVars);
    //build the new semantic representation
    console.log("pattern: "+instruct[0][1]);
    semRep[j] = [parsePattern(instruct[0][1],list),instruct[0][2],"combined "+instruct[0][2]];
    for(var k=0,len=instruct[0][3].length;k<len;k++){
        console.log("removing "+semRep[j+instruct[0][3][k]][1]+" "+semRep[j+instruct[0][3][k]][1]+" at index "+j+instruct[0][3][k]);        
        semRep.splice(j+instruct[0][3][k],1);
        if(instruct[0][3][k]<0)j+=instruct[0][3][k];
    }
    return([semRep,j]);
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
    console.log("Parse Latex");
    //semantic prototype: ["value","type","discription for user"]
    var semantic = [];
    var i = 0;
    while(i<latex.length){
        if(latex.charAt(i)=="\\"){
            console.log("   found a slash, reading word");

            i++;
            //brian's way of getting the function name breaks the script if it finds no matches
            //consider going back to the way we were doing things before,
            //or possibly matching across a widening substring
            //couls also use the left right optimizations
            //
            //could go foreward with removing any instances of \left and \right as a preperation move on the string which would fix these proplems
            //provided i include \{ and \} as parentheses

            var curWord = "";
            if(latex.substring(i).match(/^left[\(\[\|]|^left\\\{|^right\\\}|^right[\)\]\|]|^[a-zA-Z]+/g)){
                curWord = latex.substring(i).match(/^left[\(\[\|]|^left\\\{|^right\\\}|^right[\)\]\|]|^[a-zA-Z]+/g)[0];
                console.log("word length: "+curWord.length);
                i += curWord.length;
            }

            var instruct = matchWord(curWord);
            if(instruct.length == 0){
                semantic.push([curWord,"func","unknown func: "+curWord]);
                errors.push("Invalid or Unknown Syntax: "+curWord+".");
                console.log("   Invalid or Unknown Syntax: "+curWord);
            }
            else{
                console.log("       Function Word Instruct: "+curWord);
                switch(instruct[0][2]){
                    case-1: //the future case
                        //for functions we plan on supporting in the future
                        console.error("                unknown parse type:"+instruct[0][1]+" for word: "+instruct[0][0]);
                        if(instruct[0][0].length !== 0) errors.push("Fastfig doesn't solve "+instruct[0][0]+" yet.");
                        break;

                    case 0: //no op
                        //just pushes the info from the table through
                        semantic.push([instruct[0][1],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        console.log("           pushed a symbol");
                        break;

                    case 1: //delimiters
                        //you detected a delimiter, now go back and let matchParen handle it
                        //should probably include some stuff that lets matchParen determine the paren in the event it's not specified
                        //lol wut
                        //that wouldn't accomplish anything because you would need a way of making up the corresponding close paren
                        //plus it probably wouldn't parse right anyway
                        i-=(instruct[0][0].length+1);
                        var inner = matchParen(latex.substring(i),"\\"+instruct[0][0])
                        semantic.push([inner[0],instruct[0][3],instruct[0][2]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 2: //functions
                        //for things that need to be followed by parentheses
                        var inner = matchParen(latex.substring(i),"\\left(");
                        semantic.push([instruct[0][1]+inner[0],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 3: //curly functions
                        //for things that in latex are followed by sets of curly braces containing the values
                        var inner = curlyFunc(curWord, latex.substring(i),instruct[0][4],instruct[0][1]);
                        semantic.push([inner[0],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 4: //bounded functions
                        //for functions with upper and lower bounds
                        //usually a function name followed by either ^{} or _{}
                        var inner = boundedFunc(latex.substring(i),instruct[0][1]);
                        semantic.push([inner[0],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 5: //summation functions
                        var inner = sumFunc(latex.substring(i),instruct[0][1]);
                        semantic.push([inner[0],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 6: //square and nth root
                        //for the special root function which is the only thing with optional arguments like this
                        //yaaaaay for conventions!
                        var pattern = instruct[0][1];
                        var power = 2;
                        if(latex.charAt(i) == "["){
                            console.log("               apparently it's nthroot");
                            inner = matchParen(latex.substring(i, latex.length),"[",1);
                            console.log("power: "+inner[0]);
                            i+= inner[1];
                            pattern = "((\\0)^(1/\\1))";
                            power = inner[0];
                        }
                        inner = curlyFunc(curWord, latex.substring(i),instruct[0][4],pattern,power);
                        semantic.push([inner[0],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i+=inner[1];
                        break;

                    case 7: //trigonometric functions
                        //they've been broken out here to handle one of the stranger notations(by my reckoning)
                        //with trigonometric functions you are allowed to do this:    sin^2(x)^5
                        //which is equivalent to this:                                sin(x)^((2)*(5))
                        //which resolves to this:                                     sin(x)^(10)
                        //
                        //however they should never have subscripts(as far as i can tell)
                        //
                        //i don't think this applies to most other functions
                        //yaaaaay for conventions!
                        var sageCode = instruct[0][1];
                        if(latex.charAt(i) == "^"){
                            console.log("                apparently this trig function has a power");
                            i++;

                            //get the power on the function
                            var leftPow;
                            if(latex.charAt(i) == "{"){
                                inner = matchParen(latex.substring(i),"{",1);
                                i+=inner[1];
                                leftPow = inner[0];
                            }
                            else{
                                leftPow = latex.charAt(i);
                                i++;
                            }
                            console.log("                function power: "+leftPow);

                            //get the parentheses contents
                            inner = matchParen(latex.substring(i),"\\left(");
                            i+= inner[1];

                            //check if the power is -1 to make it inverse
                            if(leftPow == -1){
                                if(instruct[0][0].substring(0,3) == 'arc') sageCode = instruct[0][0].substring(3)+inner[0];
                                else sageCode = 'arc'+instruct[0][0]+inner[0];
                            }
                            else{
                                sageCode += inner[0]+"^(("+leftPow+")";

                                //check if there's a power on the right
                                if(latex.charAt(i) == "^"){
                                    i++;
                                    var rightPow;
                                    if(latex.charAt(i) == "{"){
                                        inner = matchParen(latex.substring(i),"{",1);
                                        i+=inner[1];
                                        rightPow = inner[0];
                                    }
                                    else{
                                        rightPow = latex.charAt(i);
                                        i++;
                                    }
                                    console.log("                right power: "+rightPow);
                                    sageCode += "*("+rightPow+")";
                                }
                                sageCode+=")";
                            }
                        }
                        else{
                            inner = matchParen(latex.substring(i),"\\left(");
                            i+=inner[1];
                            sageCode += inner[0];
                        }
                        semantic.push([sageCode,instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        break;

                    case 8: //log functions
                        //log functions can have subscripts but usually have default values
                        //
                        //i'm pretty sure they don't have superscripts tho
                        //
                        //yaaaaay for conventions!
                        var List = [];
                        for(var j=4,len=instruct[0].length;j<len;j++)List[j-4]=instruct[0][j];
                        var bounds = getBounds(latex.substring(i),1);
                        i+= bounds[2];
                        if(bounds[0].length>0)List[1]=bounds[0];
                        if(bounds[1].length>0)List[0]=bounds[1];
                        inner = matchParen(latex.substring(i),"\\left(",1);
                        i+=inner[1];
                        List[2] = inner[0];
                        semantic.push([parsePattern(instruct[0][1],List),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        break;

                    case 9: //limit functions
                        //i'm pretty sure limits shouldn't have superscripts
                        var List = [];
                        var bounds = getBounds(latex.substring(i),1);
                        i+= bounds[2];
                        var lower = bounds[1];
                        if(lower.indexOf("rar")!=-1){
                            console.log(" found the right arrow");
                            List[0] = lower.substring(0,lower.indexOf("rar"));
                            if(lower.substring(lower.length-1).match(/^\+$|^\-$/)){
                                List[1] = lower.substring(lower.indexOf("rar")+3,lower.length-1);
                                List[2] = ", dir====\'"+lower.substring(lower.length-1)+"\'";
                            }
                            else{
                                console.log("didn't find a direction for the limit. omitting...");
                                List[1] = lower.substring(lower.indexOf("rar")+3);
                                List[2] = "";
                            }
                        }
                        if(bounds[0] != ""){
                            console.log("getBounds returned: "+bounds[1]+"as the upper limit");
                            console.error("limits shouldn't have superscripts. ignoring");
                            //warnings.push("Limits shouldn't have superscripts. (Ignored)");
                        }
                        inner = matchParen(latex.substring(i),"\\left(",1);
                        i+=inner[1];
                        List[3] = inner[0];
                        semantic.push([parsePattern(instruct[0][1],List),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        break;

                    case 10: //removal
                        //simply doesn't push anything onto the semantic array
                        console.log("found a "+instruct[0][0]+" in need of removal");
                        break;

                    case 11: //d/dx
                        //checks to see if the first char is a d or \partial
                        //if it's d checks to see if the remainder or the whole string are in the var list
                        var out = "";
                        for(var l=0;l<semantic.length;l++)out+=semantic[l][0];
                        console.log("semantic: "+out);

                        var fracs = curlyFunc(curWord, latex.substring(i), instruct[0][4]);
                        var upper = fracs[0][0], lower=fracs[0][1];
                        if(upper == '') errors.push('Empty Numnerator');
                        if(lower == '') errors.push('Empty Denominator');
                        var list  = [];
                        i+=fracs[1];
                        var derU = derCheck(upper),derL = derCheck(lower);
                        list[0]=derU[1];
                        list[1]=derL[1];
                        if(derL[0][0] == 0 && derU[0][0] == 0){
                            console.log("just a regular fraction");
                            semantic.push([parsePattern(instruct[0][1],list),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                            break;
                        }
                        for(var l=0;l<semantic.length;l++)out+=semantic[l][0];
                        console.log("semantic: "+out);

                        console.log("upper: "+derU[0][0]+" lower: "+derL[0][0]);
                        if(derL[0][0] == 1 && derU[0][0] == 1){
                            console.log("d in both top and bottom");
                            if(derL[0][1] == 1){
                                console.log("lower has a variable");
                                if(derU[0][1] == 1){
                                    console.log("vars in both top and bottom");
                                    //should check to see if lower var appears in upper var?
                                    semantic.push([parsePattern("derivative(\\0,\\1)",list),"func","dy/dx derivative"]);
                                    break;
                                }
                                else{
                                    console.log("var only in bottom");
                                    var inner = parseLatex(latex.substring(i));
                                    i=latex.length;
                                    list[0] = inner;
                                    semantic.push([parsePattern("derivative(\\0,\\1)",list),"func","d/dx derivative"]);
                                    break;
                                }
                            }
                            else if(derU[0][1] == 1){
                                console.error("derivative variable is missing in bottom of fraction");
                                errors.push("Differentiation variable is missing in bottom of fraction.");
                                list[0]=fracs[0][0];
                                list[1]=fracs[0][1];
                                semantic.push([parsePattern(instruct[0][1],list),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                                break;
                            }
                            //d on the top and the bottom but nothing else
                            console.log("nothin but the d");
                            list[0]=fracs[0][0];
                            list[1]=fracs[0][1];
                            semantic.push([parsePattern(instruct[0][1],list),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                            break;
                        }
                        //no or only one derivative
                        console.log("no or only one derivative found");
                        list[0]=fracs[0][0];
                        list[1]=fracs[0][1];
                        semantic.push([parsePattern(instruct[0][1],list),instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        break;

                    default: //the default case
                        //shouldn't be needed or called but in the interest of stability
                        //just pushes the info from the table through
                        console.error("                unknown parse type:"+instruct[0][1]+" for word: "+instruct[0][0]);
                        //warnings.push("Unknown parse type:"+instruct[0][1]+" for word: "+instruct[0][0]+".");
                        semantic.push([instruct[0][1],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        break;
                }
            }
        }
        else if(latex.charAt(i).match(/[a-zA-Z]/)){
            curWord = "";
            console.log("       Found potential variable ");
            while(latex.charAt(i).match(/[a-zA-Z]/)){
                curWord += latex.charAt(i);
                i++;
                console.log("           current letter: "+latex.charAt(i-1)+" current word: "+curWord);
            }
            console.log("           pushing variable: "+curWord)
            semantic.push([curWord,"var","variable "+curWord]);
        }
        //    /^\d+\.?\d*$|^\.\d+$/                 makes for a great regex for this
        //    /^\d+$|^\.\d+$|^\d+\.\d+$|^\d+\.$/    works too but is a little unwieldly
        //    /^[0-9\.][0-9]*|[0-9]+\.[0-9]*$/      brian's regex
        //    /^[0-9\.][0-9]*$|^[0-9]+\.[0-9]*$/    needed a little fix
        else if(latex.charAt(i).match(/^\d$|^\.$/)){
            curWord = "";

            //FIX AND PUT BACK
            /*
            var j=i;
            console.log("   Found a number: "+latex.charAt(i))

            //this is the method using brian's regex
            //i have to test if its faster than my method
            //or just more compact
            i++;
            console.log("i:"+i+" latex.length:"+latex.length);
            while(latex.substring(j,i).match(/^\d+\.?\d*|$^\.\d+$/)){
                console.log(latex.substring(j,i));
                i++;
                if(i >= latex.length-1)break;
            }
            curWord = latex.substring(j,i);
            while(curWord.length >1 && curWord.charAt(0)=="0" && curWord.charAt(1) != "."){
                curWord = curWord.substring(1);
                errors.push("Numbers should never have leading zeros. They've been removed... this time.");
                console.error("Numbers should never have leading zeros. They've been removed... this time.");
            }

            */
            //this is a really stupid way of doing this but i'm tired
            //just write a regex that matches exactly one period
            //match the current word + char at i
            //if it matches then go ahead and add it to the word and increment
            //otherwise break out and enter the next loop
            //

            var dotCount = 0;
            while(latex.charAt(i).match(/^\d$|^\.$/)){
                if(latex.charAt(i) == "."){
                    if(dotCount <1){
                        dotCount++;
                        curWord += ".";
                        i++;
                        console.log("current digit: . current number: "+curWord);
                    }
                    else break;
                }
                else if(latex.charAt(i).match(/^\d$/)){
                    curWord += latex.charAt(i);
                    console.log("current digit: "+latex.charAt(i)+" current number: "+curWord);
                    i++;
                }
            }
            while(curWord.length >1 && curWord.charAt(0)=="0" && curWord.charAt(1) != "."){
                curWord = curWord.substring(1);
                //warnings.push("Numbers shouldn't have leading zeros. They've been removed... this time.");
                console.error("Numbers should never have leading zeros. They've been removed... this time.");
            }
            console.log("   pushing whole number: "+curWord);
            semantic.push([curWord,"num","number "+curWord]);
        }
        /*
         *for if theres a blank space
         *happens when variables follow latex words
         *should be eliminated by the semantic parser
         *this code is meaningless
         *
         *REMOVE
         *
         */
        else if(latex.charAt(i)== " "){
            if(latex.length == 1){
                console.log("empty field");
                //warnings.push("Empty field.");
            }
            i++;
        }
        else{
            //single character switch goes here
            console.log("   Single Char instruct: "+latex.charAt(i));
            var instruct = charMatch(latex.charAt(i));
                switch(instruct[1]){
                    case 0://regular character
                        console.log("       Standard char");
                        semantic.push([instruct[0],instruct[2],instruct[2]+instruct[0]]);
                        i++;
                        break;
                    case 1://a delimiter
                        console.log("       Delimiter");
                        var inner = matchParen(latex.substring(i, latex.length),instruct[0]);
                        semantic.push([inner[0],instruct[2],instruct[2]+instruct[0]]);
                        i+= (inner[1]);
                        break;
                    case 2:
                        console.log("       Function char");
                        i++;
                        if(latex.charAt(i) == "{"){
                            var inner = matchParen(latex.substring(i, latex.length),"{",1);
                            semantic.push([instruct[0]+"("+inner[0]+")",instruct[2],instruct[2]+instruct[0]]);
                            i+=inner[1];
                            break;
                        }
                        else{
                            semantic.push([instruct[0]+"("+parseLatex(latex.charAt(i))+")",instruct[2],instruct[2]+instruct[0]]);
                            i++;
                            break;
                        }
                        break;
                    case 3:
                        console.log(instruct[2]+" function char");
                        i++;
                        if(latex.charAt(i) == "{"){
                            var inner = matchParen(latex.substring(i, latex.length),"{",1);
                            semantic.push([instruct[0]+inner[0],instruct[2],instruct[2]+instruct[0]]);
                            i+=inner[1];
                            break;
                        }
                        else{
                            semantic.push([instruct[0]+parseLatex(latex.charAt(i)),instruct[2],instruct[2]+instruct[0]]);
                            i++;
                            break;
                        }
                        break;
                    default:
                        //the default case
                        //shouldn't be needed or called but in the interest of stability
                        //just pushes the info from the table through
                        errors.push("Unknown charactor type: '"+instruct[0][0]+"'.");
                        semantic.push([instruct[0][1],instruct[0][3],instruct[0][3]+instruct[0][0]]);
                        i++;
                        break;
                }
            //this isn't nesseceary anymore since it's handled properly by each portion of the program
            //i++;
        }
    }
    var sageCode = "";
    if(semantic.length >1)semantic = parseSemantic(semantic);
    for(var i=0, len = semantic.length;i<len;i++){
        //if there is a var push it into the var list

        //MOVE THIS CODE INTO PARSE SEMANTIC ANYWAY DUHH
        //its going to be used there for lookups and setting the equivalence and if its in the table there anyway.
        if(semantic[i][1] == "var"){
            console.log("checking if "+semantic[i][0]+" is in the variable list");
            //check if the var exists already in the varlist
            if(varList.length == 0){
                console.log("adding "+semantic[i][0]+" to the variable list");
                varList.push(semantic[i][0]);
            }
            else{
                for(var j=0,len2=varList.length;j<len2;j++){
                    console.log(varList[j]);
                    if(varList[j] == semantic[i][0])break;
                    if(j == varList.length-1){
                        console.log("adding "+semantic[i][0]+" to the variable list");
                        varList.push([semantic[i][0],"var"]);
                    }
                }
            }
        }
        sageCode+=semantic[i][0];
    }
    colored = semantic;
    console.log("finished sage code: "+sageCode);
    console.log("");
    return sageCode;
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

function derCheck(string){
    var derFlag = [0,0], func="";
    if(string.charAt(0) == "d"){
        derFlag[0]=1;
        if(string.length > 2 && string.charAt(1) == " "){
            //partial differential equation. i must look up what this means
            if(string.substring(2).match(/^[a-zA-Z]+$/)){
                func = string.substring(2);
                derFlag[1]=1;
                /*
                func = varLookUp(string.substring(2));
                if(func != false){
                    derFlag[1] = 1;
                }
                derFlag[1] = 1;
                */
            }
            else func=string;
        }
        else if(string.length > 1){
            if(string.substring(1).match(/^[a-zA-Z]+$/)){
                func = string.substring(1);
                derFlag[1]=1;
                /*
                func = varLookUp(string.substring(1));
                if(func != false){
                    derFlag[1] = 1;
                }
                derFlag[1] = 1;
                */
            }
            else func = string;
        }
    }
    else func=string;
    return([derFlag, func]);
}

//the flag just tells the function weither to parse the contents of the parentheses or not
function matchParen(substr,type,flag){ 
    console.log("matchParen");
    var parenTypes = [
        //standard parentheses for sage
        ["\\left(","\\right)","(",")"],
        ["(",")","(",")"],

        //sage dictionary parens
        ["\\left\\{","\\right\\}","numpy.array([","])"],
        ["\\{","\\}","{","}"],
        ["{","}","{","}"],

        //sage set parens
        ["\\left[","\\right]","[","]"],
        ["[","]","[","]"],

        //absolute value parens
        ["|","|","abs(",")"],
        ["\\left|","\\right|","abs(",")"],
        ["lvert","rvert","abs(",")"],
        ["\\lvert","\\rvert","abs(",")"],
        ["left\\lvert","right\\rvert","abs(",")"],


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

    //Names of parentheses (used for error messages)
    var parenthName = {
            "\\left(":      "parentheses",
            "(":            "parentheses",
            "\\lceil":      "parentheses",
            "left\\lceil":  "parentheses",
            "lceil":        "parentheses",
            "left\\lfloor": "parentheses",
            "\\lfloor":     "parentheses",
            "lfloor":       "parentheses",
            "\\left\\{":    "brace",
            "\\{":          "brace",
            "{":            "brace",
            "\\left[":      "bracket",
            "[":            "bracket",
            "|":            "pipe (|)",
            "\\left|":      "pipe (|)",
            "lvert":        "pipe (|)",
            "\\lvert":      "pipe (|)",
            "left\\lvert":  "pipe (|)",
            "left\\langle": "angle delimiter",
            "\\langle":     "angle delimiter",
            "langle":       "angle delimiter",
            "left\\Lvert":  "double pipes (||)",
            "\\Lvert":      "double pipes (||)",
            "Lvert":        "double pipes (||)"
        }

    console.log("    lookup paren type: "+type);
    var parenSet = "";
    for(var j=0,len=parenTypes.length;j<len;j++){
        //console.log(j+" parentypes: "+parenTypes[j]);
        if(parenTypes[j][0]==type){
            console.log("    mached to paren type: "+parenTypes[j]);
            parenSet=parenTypes[j];
            break;
        }
    }
    if(parenSet == ""){
        console.log("    unknown paren type: "+type);
        errors.push("Unknown parentheses type: '"+type+"'.");
        return([parseLatex(substr.substring(type.length,substr.length)),substr.length]);
    }

    console.log("    match paren type: "+parenSet[0]+" "+parenSet[1]+" on substring: "+substr);
    //missing starting left paren
    if(substr.substring(0,parenSet[0].length) != parenSet[0]){
        console.error("    "+substr.substring(0,parenSet[0].length)+" is not a left paren of form: "+parenSet[0]);

        errors.push("Left "+ parenthName[parenSet[0]] + " is missing.");

        if(flag != 1)return([parseLatex(substr),substr.length]);
        else return([substr,substr.length]);
    }

    var left = 0;
    var right = 0;
    var i = 0;
    while(i<=substr.length){
        if(right == left && i>1){
            console.log("    parsing inner substring: "+substr.substring(parenSet[0].length,i-parenSet[1].length));
            if(flag != 1) return([parenSet[2]+parseLatex(substr.substring(parenSet[0].length,i-parenSet[1].length))+parenSet[3],i]);
            else return([parseLatex(substr.substring(parenSet[0].length,i-parenSet[1].length)),i]);
        }
        else{
            //console.log("    left: "+left+" right: "+right+" remaining string: "+substr.substring(i));
            //console.log("    match: "+substr.substring(i,i+parenSet[1].length)+" == "+parenSet[0]+" or "+parenSet[1]);
            if(substr.substring(i,i+parenSet[0].length) == parenSet[0]){
                left++;
                i+=parenSet[0].length;
                //console.log("    matched a left paren");
                continue;
            }
            else if(substr.substring(i,i+parenSet[1].length) == parenSet[1]){
                right++;
                i+=parenSet[1].length;
                //console.log("    matched a right paren");
                continue;
            }
            else i++;
        }
    }
    errors.push("Right "+ parenthName[parenSet[0]] + " is missing.");
    console.error("right paren: "+parenSet[1]+" is missing. check mathquill inserting parens");
    if(flag != 1)return([parseLatex(substr.substring(parenSet[0].length)),substr.length]);
    else return([substr.substring(parenSet[0].length),substr.length]);
}

function curlyFunc(name, substr,numVar,pattern,extraVars) { //BRIAN added the required name field as the name of the function (used for nice errors)
    console.log("curlyFunc");
    console.log("    parsing string: "+substr+" using pattern: "+pattern+" with "+numVar+" variables");

    if(substr.charAt(0) != "{"){
        errors.push("Syntax Error near '"+substr+"'.");
        console.error("    "+substr+" didn't start with curlys");
        return([parseLatex(substr),substr.length]);
    }
    var vars = [];
    var i = 0;
    while(vars.length < numVar){
        if(i > substr.length){
            console.error('    did not find required number of variables, check if the parse table is looking for the right number');
            errors.push("Function '"+name+"' requires "+numVar+" arguments.");
            break;
        }
        if(substr.charAt(i) == "{"){
            console.log("    found a left curly at pos: "+i);
            inner = matchParen(substr.substring(i),"{",1);
            vars.push(inner[0]);
            i+= inner[1];
        }
        else{
            console.error('    found no curly. parse table might have wrong num vars');
            break;
        } 
    }
    if(extraVars != undefined){
        console.log("    adding extra vars to list.");
        vars = vars.concat(extraVars);
    }

    if(pattern == undefined){
        console.log("no pattern found. returning vars");
        return([vars,i]);
    }
    else{
        console.log("    putting vars in pattern: "+pattern);
        //should i check if all of the variables are present?
        //probably
        //i should also sub out "" for "none"
        for(var k=0,len=vars.length;k<len;k++)console.log("variable "+k+": "+vars[k]);
        return([parsePattern(pattern,vars),i]);
    } 

}

//takes a pattern that variables should be inserted into
//inserts the variable with an index matching that of variables in the pattern
//variable locations look like \\1 
//where 1 is the index of the variable we want to insert
function parsePattern(pattern,vars){
    console.log("parsePattern");
    console.log("    parsing pattern: "+pattern+" with vars: "+vars);
    var sageCode = "";
    var j = 0;
    while(j < pattern.length){
        if(pattern.charAt(j) == "\\"){
            console.log("        found a variable");
            var curVar = "";
            j++;
            while(pattern.charAt(j).match(/[0-9]/)){
                curVar += pattern.charAt(j);
                j++;
            }
            console.log("        variable: "+curVar+" inserting: "+vars[curVar]);
            sageCode+=vars[curVar];
        }
        sageCode+=pattern.charAt(j);
        console.log("    output: "+sageCode);
        j++;
    }
    return(sageCode);
}

//all of the sum parsing code
//sums are a special case besides just upper and lower bounds,
//they have several special cases depending on the upper and lower bounds
//even meaning different thing depending on what is defined
function sumFunc(substr,pattern){
    console.log("sumFunc");
    console.log("    parsing string: "+substr+" using pattern: "+pattern);
    var vars = ["None","None","None","None"];
    var i = 0;

    var bounds = getBounds(substr,1);
    i+= bounds[2];

    //code for assumed sum goes here
    //for the defaults i'm using it will throw an error because it doesn't know if i is greater than or less than 0
    //you can use assume(i>0) in sage to fix this.

    if(bounds[1] != ""){
        if(bounds[1].match("=")!=null){
            if(isVar(bounds[1].substring(0,bounds[1].indexOf("=")))){
                vars[2] = bounds[1].substring(0,bounds[1].indexOf("="));
                vars[1] = bounds[1].substring(bounds[1].indexOf("=")+1);
            }
        }
        else{
            console.error("    lower bound is empty");
            errors.push("Sum lower bound is empty.");
        }
    }

    if(bounds[0].length > 0) vars[0] = bounds[0];
    var func = parseLatex(substr.substring(i)); 
    
    if(func.length>0){
        vars[3] = func;
        if(vars[3].match(vars[2])==null){
            console.error("summation variable does not appear in function");
            //warnings.push("Summation variable does not appear in function.");  //NOT SURE THAT IT GETS HERE EVER
        }
    }
    else{
        console.error("Summation requires a formula");
        errors.push("Summation requires a formula");
    }
    
    console.log("putting variables in pattern: "+vars);    
    return([parsePattern(pattern,vars),substr.length]);
}

//when a function is assumed to have bounded values
//on the frontend we can use this as a template for more informative error messages
//on the backend this might apply to all bounded functions
//more specific functions will be required for error reporting on the front end
function boundedFunc(substr,pattern,vars){
    console.log("boundedFunc");
    console.log("    parsing string: "+substr+" using pattern: "+pattern);

    //variables in these locations mean the following
    //potentially changing to an array of objects with names.
    //  vars = ["function to the right","an iterated variable or set","a lower bound","an upper bound"]
    if(!vars)vars = ["None","None","None","None"];
    var i = 0;

    //if there are bounds this function will find them and return them 
    var bounds = getBounds(substr,1);
    i+= bounds[2];

    //find the variable in the lower bound
    console.log("    searching the lower bound for a variable")
    if(bounds[1].length != 0){
        if(bounds[1].match("=")!=null){
            if(isVar(bounds[1].substring(0,bounds[1].indexOf("=")))){
                vars[1] = bounds[1].substring(0,bounds[1].indexOf("="));
            }
            if(bounds[1].substring(bounds[1].indexOf("=")+1) != ""){
                vars[2] = bounds[1].substring(bounds[1].indexOf("=")+1);
            }
        }
        else console.log("        equal sign missing in lower bound");
    }
    else console.log("    lower bound is empty");

    if(bounds[0].length > 0) vars[3] = bounds[0];
    else console.log("    upper bound is empty");

    var func = parseLatex(substr.substring(i)); 
    if(func.length>0)vars[3] = func;
    if(vars[2] != "None"){
        if(vars[3].match(vars[2])==null){
            //warnings.push("Summation variable does not appear in function."); //NOT SURE THAT IT GETS HERE EVER
        }
    }   
    return([parsePattern(pattern,vars),substr.length]);
}

//check if the substring is a variable
function isVar(substr){
    console.log("isVar");
    return(/^[a-zA-Z]+$/.test(substr));
}

//takes a function that is assumed to have bounds
//returns the contents of the upper and lower bounds, as well as the pointer location following them.
//if there are no detectable bounds then returns empty things
//does not parse them so that further analyzation can take place
//probably should parse them now that symbolics is up
function getBounds(substr,flag){
    if(flag == undefined)flag = 0;
    console.log("getBounds");
    if(substr.charAt(i) != "^" && substr.charAt(i) != "_"){
        //this means there are no bounds to detect. return blank stuff
        //just here to allow for speed improvements
        console.log("    no bounds detected");
        return(["","",0]);                    
    }

    //i can remove one of these once i decide on a convention instituted by mathwquill
    //i should probably keep both around because some books or external clients might have different conventions

    var upper = "";
    var lower = "";
    var i = 0;

    //get the upper bound if it leads
    if(substr.charAt(i) == "^"){
        console.log("    starting with upper");
        i++;
        if(substr.charAt(i) == "{"){
            inner = matchParen(substr.substring(i),"{",flag);
            console.log("    upper bound inner latex: "+inner[0]);
            upper = inner[0];
            i+= inner[1];
        }
        else{
            upper = substr.charAt(i);
            i++;
        }
        //the lower bound is assumed to follow
        console.log("    looking for lower bound in substr: "+substr.substring(i));
        if(substr.charAt(i) == "_"){
            console.log("        found lower bound");
            i++;
            if(substr.charAt(i) == "{"){
                inner = matchParen(substr.substring(i),"{",flag);
                console.log("        lower bound inner latex: "+inner[0]);
                lower = inner[0];
                i+= inner[1];
            }
            else{
                console.log("        lower bound inner latex: "+substr.charAt(i));
                lower = substr.charAt(i);
                i++;
            }
        }

    }
    //get the lower bound if it leads
    else if(substr.charAt(i) == "_"){
        console.log("    starting with lower");
        i++;
        if(substr.charAt(i) == "{"){
            inner = matchParen(substr.substring(i),"{",flag);
            console.log("        lower bound inner latex: "+inner[0]);
            lower = inner[0];
            i+= inner[1];
        }
        else{
            console.log("        lower bound inner latex: "+substr.charAt(i));
            lower = substr.charAt(i);
            i++;
        }
        //then get the upper bound is assumed to follow
        console.log("    looking for upper bound");
        if(substr.charAt(i) == "^"){
            console.log("        upper bound found");
            i++;
            if(substr.charAt(i) == "{"){
                inner = matchParen(substr.substring(i),"{",flag);
                console.log("        upper bound inner latex: "+inner[0]);
                upper = inner[0];
                i+= inner[1];
            }
            else{
                console.log("upper bound inner latex: "+substr.charAt(i));
                upper = substr.charAt(i);
                i++;
            }
        }
    }
    return([upper,lower,i]);
}

//does lookups on chars in the char table to see if special functions must be performed
//only for non alphabetic characters
//returns the instruction set for the character if it finds one
//otherwise returns instructions for an unknown char
function charMatch(let){
    console.log("charMatch")
    //[char,switch,semantic val]
    //switch vals:
    //0 - regular char
    //1 - paren
    //2 - sub and sup, followed by one char or a curly
    //
    var charTable = [
        ["{",1,"paren"],
        ["\\{",1,"paren"],
        ["}",1,"paren"],
        ["\\}",1,"paren"],
        [")",1,"paren"],
        ["(",1,"paren"],
        ["[",1,"paren"],
        ["]",1,"paren"],
        ["|",1,"func"],
        ["^",2,"sup"],
        ["_",3,"sub"],
        ["+",0,"binOp"],
        ["-",0,"binOp"],
        ["*",0,"binOp"],
        ["/",0,"binOp"],
        ["=",0,"equiv"],
        ["<",0,"comp"],
        [">",0,"comp"],
        ["!",0,"comb"],
        ["\'",0,"prime"],
        [",",0,"sageS"],
        [":",0,"sageS"],
        ["\"",0,"sageS"],
        [" ",0,""],
    ];

    console.log("   Char lookup: "+let);
    for(var i=0,len=charTable.length; i<len;i++){
        if(charTable[i][0]==let){
            console.log("       Char match: "+charTable[i][0]);
            return charTable[i];
        }
    }
    console.error("    Unknown letter or symbol: "+let);
    errors.push("Unknown letter or symbol: '"+let+"'.");
    return([let,0,"err"]);
}

//does lookups on words in the same way as charMatch 
function matchWord(curWord, table){

    //table for elements that combine with those arround them in a distinct way
    //[element, pattern, type after parse, relative location of elements, expected element type]
    //going to hold of on the expected type for now
    var combTable = [
        ["!","factorial(\\0)","func",[-1],[["var","num","func","paren"]],[0]],
        ["\'","derivative(\\0(\\1),\\1,\\2)","func",[-1,1],[["var"],["paren"]],[0,1]],
        ["int","integrate\\2,\\3,\\0,\\1)","func",[1,2,3,4],[["sup","sub"],["sup","sub"],["paren"],"var"],[0,0,1,1]],
    ]

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
        ["arcsinh","arcsinh",7,"func"],

        //cosine
        ["cos","cos",7,"func"],
        ["arccos","arccos",7,"func"],
        ["cosh","cosh",7,"func"],
        ["arccosh","arccosh",7,"func"],

        //tangent
        ["tan","tan",7,"func"],
        ["arctan","arctan",7,"func"],
        ["tanh","tanh",7,"func"],
        ["arctanh","arctanh",7,"func"],

        //cotangent
        ["cot","cot",7,"func"],
        ["arccot","arccot",7,"func"],
        ["coth","coth",7,"func"],
        ["arccoth","arccoth",7,"func"],

        //cosecant
        ["csc","csc",7,"func"],
        ["arccsc","arccsc",7,"func"],
        ["csch","csch",7,"func"],
        ["arccsch","arccsch",7,"func"],

        //secant
        ["sec","sec",7,"func"],
        ["arcsec","arcsec",7,"func"],
        ["sech","sech",7,"func"],
        ["arcsech","arcsech",7,"func"],

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
        //
        //temporary integrate fix:
        ["int","integrate",2,"func"],
        //["int","integrate(\\0,\\1,\\2,\\3)",4,"func"],
        //["int","integrate(\\0,\\1,\\2,\\3)",0,"comb"],

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

    console.log("matchWord");
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
        console.error("unknown  function word: "+curWord);
        if(curWord.length !== 0) errors.push("Unknown function: '"+curWord+"'.");
        return([[curWord,curWord,-1,"err"]]);
    }
    console.log("   Length matches: "+dispDict);

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
        console.log("   Letter matches: "+dispDict);
        k++;
    }
    if(curDict.length != 0){
        if(curDict[0][0] == curWord){
            console.log("word instructions: "+curDict[0]);
            return curDict;
        }
        else{
            console.error("unknown  function word: "+curWord);
            errors.push("Unknown function: '"+curWord+"'.");
            return([[curWord,curWord,"-1","err"]]);
        }
    }
    else{
        console.error("unknown  function word: "+curWord);
        errors.push("Unknown function: '"+curWord+"'.");
        return([[curWord,curWord,"-1","err"]]);
    }
}