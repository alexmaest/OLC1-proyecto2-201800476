%{
%}

%lex
%options case-insensitive

%%

\s+                                           // omite espacios
\/\/[^\n]*                                   // comentario simple línea
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]			// comentario multiple líneas  
     

//Palabras reservadas

"int"                return 'int'
"double"             return 'double'
"boolean"            return 'boolean'
"char"               return 'char'
"string"             return 'string'
"void"               return 'void'
"new"                return 'new'
"if"                 return 'if'
//"else if"            return 'else if'
"else"               return 'else'
"print"              return 'print'
"println"            return 'println'
"continue"           return 'continue'
"return"             return 'return'
"break"              return 'break'
"switch"             return 'switch'
"case"               return 'case'
"default"            return 'default'
"while"              return 'while'
"for"                return 'for'
"do"                 return 'do'
"run"                return 'run'
"tolower"            return 'tolower'
"toupper"            return 'toupper'
"round"              return 'round'
"length"             return 'length'
"typeof"             return 'typeof'
"tostring"           return 'tostring'
"tochararray"        return 'tochararray'

//Simbolos

"["                 return '['
"]"                 return ']'
"{"                 return '{'
"}"                 return '}'
"("                 return '('
")"                 return ')'
"<="                return '<='
">="                return '>='
"<"                 return '<'
">"                 return '>'
"=="                return '=='
"!="                return '!='
"||"                return '||'
"&&"                return '&&'
"!"                 return '!'
"?"                 return '?'
"++"                return '++'
"--"                return '--'
"+"                 return '+'
"-"                 return '-'
"*"                 return '*'
"/"                 return '/'
"^"                 return '^'
"%"                 return '%'
"*"                 return '*'
";"                 return ';'
":"                 return ':'
","                 return ','
"="                 return '='

//Expresiones regulares

(true|false)                                return 'Tx_Boolean';
(\'[^'\\]\')                                return 'Tx_Char';
\"[^\"]*\"                                  return 'Tx_String';
[0-9]+\.[0-9]+                              return 'Tx_Double';
[0-9]+                                      return 'Tx_Integer';
[A-Za-zÑñ_]+[0-9_]*                          return 'Tx_Id';
//(\'[^'\\]\')|(\'(\\\\|\\n|\\t|\\r|\\")\')   return 'Tx_Char';

<<EOF>>				return 'EOF';
.					{
                        allError.listErrores().addError(new lexicError("Error: Valor no valido de forma léxica \"" + yytext + "\"",yylloc.first_line,yylloc.first_column));
                    }
/lex

%right          '++','--'
%left           '?',':'
%left           '||'
%left           '&&'
%right          '!' 
%left           '!=', '==''<=','>=','<','>'
%left           '+','-'
%left           '*', '/', '%'
%nonassoc       '^'
%nonassoc       '(' , ')'
%right          UMENOS


%start INICIO

%%

INICIO : INSTRUCCIONES_G EOF {try{console.log("Análisis terminado");return $1;}catch(e){console.log("Se han producido errores en el análisis");}}
;
INSTRUCCIONES_G : INSTRUCCIONES_G INSTRUCCION_G {$1.push($2);$$ = $1;}
| INSTRUCCION_G {$$ = [$1];}
| error {allError.listErrores().addError(new sintacticError("Error: Valor no valido de forma sintáctica \"" + yytext + "\"",@1.first_line, @1.first_column));}
;
INSTRUCCION_G : TIPO_VAR VARIABLE ';' {$$ = new Variables($1,$2,@1.first_line,@1.first_column);}
| FUNCION {$$=$1;}
| RUN {$$=$1;}
| IMPRIMIR {$$=$1;}
;
RUN : 'run' Tx_Id '(' ')' ';'{$$=new Llamada($2,'RUN',[],@1.first_line,@1.first_column);}
| 'run' Tx_Id '(' EXP_LIST ')' ';' {$$=new Llamada($2,'RUN',$4,@1.first_line,@1.first_column);}
;
IMPRIMIR : 'print' '(' EXP ')' ';' {$$ = new Imprimir('print',$3,@1.first_line,@1.first_column);}
| 'println' '(' EXP ')' ';' {$$ = new Imprimir('println',$3,@1.first_line,@1.first_column);}
;
EXP_LIST : EXP_LIST ',' EXP {$1.push($3);$$ = $1;}
| EXP {$$ = [$1];}
;
FUNCION : Tx_Id '(' PARAMETROS ')' ':' TIPO_VAR BLOQUE {$$=new Funcion($1,$3,$6,$7,1,@1.first_line,@1.first_column);}
| Tx_Id '(' ')' ':' TIPO_VAR BLOQUE {$$=new Funcion($1,[],$5,$6,2,@1.first_line,@1.first_column);}
| Tx_Id '(' PARAMETROS ')' BLOQUE {$$=new Funcion($1,$3,null,$5,3,@1.first_line,@1.first_column);}
| Tx_Id '(' ')' BLOQUE {$$=new Funcion($1,[],null,$4,4,@1.first_line,@1.first_column);}
;
PARAMETROS : PARAMETROS ',' TIPO_VAR Tx_Id {$1.push(new Parametro($3,$4,'variable'));$$ = $1;}
| PARAMETROS ',' TIPO_VAR '[' ']' Tx_Id {$1.push(new Parametro($3,$6,'array'));$$ = $1;}
| PARAMETROS ',' TIPO_VAR '[' ']' '[' ']' Tx_Id {$1.push(new Parametro($3,$8,'array_doble'));$$ = $1;}
| PARAMETROS ',' TIPO_VAR Tx_Id '[' ']' {$1.push(new Parametro($3,$6,'array'));$$ = $1;}
| PARAMETROS ',' TIPO_VAR Tx_Id '[' ']' '[' ']' {$1.push(new Parametro($3,$8,'array_doble'));$$ = $1;}
| TIPO_VAR '[' ']' Tx_Id {$$ = [new Parametro($1,$4,'array')];}
| TIPO_VAR '[' ']' '[' ']' Tx_Id {$$ = [new Parametro($1,$6,'array_doble')];}
| TIPO_VAR Tx_Id '[' ']' {$$ = [new Parametro($1,$4,'array')];}
| TIPO_VAR Tx_Id '[' ']' '[' ']' {$$ = [new Parametro($1,$6,'array_doble')];}
| TIPO_VAR Tx_Id {$$ = [new Parametro($1,$2,'variable')];}
;
INSTRUCCIONES_L : INSTRUCCIONES_L INSTRUCCION_L {$1.push($2);$$ = $1;}
| INSTRUCCION_L {$$ = [$1];}
| error {allError.listErrores().addError(new sintacticError("Error: Valor no valido de forma sintáctica \"" + yytext + "\"",@1.first_line, @1.first_column));}
;
INSTRUCCION_L : TIPO_VAR VARIABLE ';' {$$ = new Variables($1,$2,@1.first_line,@1.first_column);}
| ASIGNACION ';' {$$=$1;}
| LLAMADA_F ';' {$$=$1;}
| SENTENCIAS {$$=$1;}
| TRANSFERENCIA ';' {$$=$1;}
| IMPRIMIR {$$=$1;}
;
TRANSFERENCIA : 'break' {$$ = new Break();}
| 'return' EXP {$$ = new Return($2);}
| 'return' {$$ = new Return(null);}
| 'continue' {$$ = new Continue();}
;
SENTENCIAS : IF {$$=$1;}
| SWITCH {$$=$1;}
| WHILE {$$=$1;}
| FOR {$$=$1;}
| DOWHILE {$$=$1;}
;
IF : 'if' '(' EXP ')' BLOQUE ELSE {$$ = new If($3,$5,$6,@1.first_line,@1.first_column);}
;
ELSE :'else' BLOQUE{$$ = $2;}
| 'else' IF {$$ = $2;}
| /*epsilon*/ {$$ = null;}
;
SWITCH : 'switch' '(' EXP ')' BLOQUE_SWITCH {$$ = new Switch($3,$5,@1.first_line,@1.first_column);}
;
CASE_LIST : CASE_LIST 'case' EXP ':' INSTRUCCIONES_L {
    var bloque = new Bloque($5,@1.first_line,@1.first_column);
    var singleCase =  new Case($3, bloque, 'CASE');
    $1.push(singleCase);
    $$ = $1;
}
| 'case' EXP ':' INSTRUCCIONES_L {
    var bloque = new Bloque($4,@1.first_line,@1.first_column);
    var singleCase =  new Case($2, bloque, 'CASE');
    $$ = [singleCase];
}
;
DEFAULT : 'default' ':' INSTRUCCIONES_L {
    var bloque  = new Bloque($3,@1.first_line,@1.first_column);
    var singleCase =  new Case(null, bloque, 'DEFAULT');
    $$ = singleCase;
}
;
WHILE : 'while' '(' EXP ')' BLOQUE {$$ = new While($3,$5,@1.first_line,@1.first_column);}
;
FOR : 'for' '(' TIPO_VAR VARIABLE ';' EXPREL ';' ASIGNACION ')' BLOQUE {$$ = new For(new Variables($3,$4,@1.first_line,@1.first_column),$6,$8,$10,@1.first_line,@1.first_column);}
| 'for' '(' ASIGNACION ';' EXPREL ';' ASIGNACION ')' BLOQUE {$$ = new For($3,$5,$7,$9,@1.first_line,@1.first_column);}
;
DOWHILE : 'do' BLOQUE 'while' '(' EXP ')' ';' {$$ = new DoWhile($2,$5,@1.first_line,@1.first_column);}
;
BLOQUE_SWITCH : '{' CASE_LIST DEFAULT '}' {$2.push($3);$$ = $2;}
| '{' CASE_LIST '}' {$$ = $2;}
| '{' DEFAULT '}' {$$ = [$2];}
;
BLOQUE : '{' '}' {$$=new Bloque([],@1.first_line,@1.first_column);}
| '{' INSTRUCCIONES_L '}'{$$=new Bloque($2,@1.first_line,@1.first_column);}
;
LLAMADA_F : Tx_Id '(' ')' {$$=new Llamada($1,'NORMAL',[],@1.first_line,@1.first_column);}
| Tx_Id '(' EXP_LIST ')' {$$=new Llamada($1,'NORMAL',$3,@1.first_line,@1.first_column);}
| 'tolower' '(' EXP ')' {$$=new Llamada($1,'TOLOWER',$3,@1.first_line,@1.first_column);}
| 'toupper' '(' EXP ')' {$$=new Llamada($1,'TOUPPER',$3,@1.first_line,@1.first_column);}
| 'round' '(' EXP ')' {$$=new Llamada($1,'ROUND',$3,@1.first_line,@1.first_column);}
| 'length' '(' EXP ')' {$$=new Llamada($1,'LENGTH',$3,@1.first_line,@1.first_column);}
| 'typeof' '(' EXP ')' {$$=new Llamada($1,'TYPEOF',$3,@1.first_line,@1.first_column);}
| 'tostring' '(' EXP ')' {$$=new Llamada($1,'TOSTRING',$3,@1.first_line,@1.first_column);}
| 'tochararray' '(' EXP ')' {$$=new Llamada($1,'TOCHARARRAY',$3,@1.first_line,@1.first_column);}
;
VARIABLE : VARIABLE ',' ASIGNACION {$1.push(new Variable($3,'ASIGNACION'));$$ = $1;}
| VARIABLE ',' Tx_Id {$1.push(new Variable($3,'NORMAL'));$$ = $1;}
| VARIABLE ',' Tx_Id '[' ']' {$1.push(new Variable($3,'SINGLE_ARRAY'));$$ = $1;}
| VARIABLE ',' Tx_Id '[' ']' '[' ']' {$1.push(new Variable($3,'DOUBLE_ARRAY'));$$ = $1;}
| ASIGNACION {$$ = [new Variable($1,'ASIGNACION')];}
| Tx_Id {$$ = [new Variable($1,'NORMAL')];}
| Tx_Id '[' ']' {$$ = [new Variable($1,'SINGLE_ARRAY')];}
| Tx_Id '[' ']' '[' ']' {$$ = [new Variable($1,'DOUBLE_ARRAY')];}
;
ASIGNACION: Tx_Id '=' EXP {$$ = new Asignacion($1,$3,'NORMAL',@1.first_line,@1.first_column);}
| Tx_Id '[' ']' '=' EXP {$$ = new Asignacion($1,$5,'SINGLE_ARRAY',@1.first_line,@1.first_column);}
| Tx_Id '[' ']' '[' ']' '=' EXP {$$ = new Asignacion($1,$7,'DOUBLE_ARRAY',@1.first_line,@1.first_column);}
| Tx_Id '[' EXP ']' '=' EXP {$$ = new Asignacion($1,new ModificacionArray($3,$6),'NORMAL',@1.first_line,@1.first_column);}
| Tx_Id '[' EXP ']' '[' EXP ']' '=' EXP {$$ = new Asignacion($1,new ModificacionArrayDoble($3,$6,$9),'NORMAL',@1.first_line,@1.first_column);}
| Tx_Id '++' {$$=new OperacionSimplificada($1,'++');}
| Tx_Id '--' {$$=new OperacionSimplificada($1,'--');}
;
TIPO_VAR : 'int' {$$=$1.toLowerCase();}
| 'double' {$$=$1.toLowerCase();}
| 'boolean' {$$=$1.toLowerCase();}
| 'char' {$$=$1.toLowerCase();}
| 'string' {$$=$1.toLowerCase();}
| 'void' {$$=$1.toLowerCase();}
;
EXP : EXPMATH {$$=$1;}
| EXPOP {$$=$1;}
| EXPREL {$$=$1;}
| EXPTER {$$=$1;}
| LLAMADA_F {$$=$1;}
| '(' TIPO_VAR ')' EXP {$$=new Casteo($2,$4,@1.first_line,@1.first_column);}
| '(' EXP ')' {$$=$2;}
| ARRAY {$$=$1;}
| VALORES {$$=$1;}
| Tx_Id {$$=new Id($1);}
| Tx_Id '++' {$$=new OperacionSimplificada($1,'++');}
| Tx_Id '--' {$$=new OperacionSimplificada($1,'--');}
;
ARRAY : 'new' TIPO_VAR '[' EXP ']' {$$ = new nuevoArraySimple($2,$4);}
| 'new' TIPO_VAR '[' EXP ']' '[' EXP ']' {$$ = new nuevoArrayDoble($2,$4,$7);}
| '[' EXP_LIST ']' {$$ = new NuevoArray($2);}
| Tx_Id '[' EXP ']' {$$ = new AccesoArraySimple($1,$3);}
| Tx_Id '[' EXP ']' '[' EXP ']' {$$ = new AccesoArrayDoble($1,$3,$6);}
;
EXPMATH : EXP '+' EXP {$$=new Operacion($1,$3,'+');}
| EXP '-' EXP {$$=new Operacion($1,$3,'-');}
| EXP '/' EXP {$$=new Operacion($1,$3,'/');}
| EXP '*' EXP {$$=new Operacion($1,$3,'*');}
| EXP '^' EXP {$$=new Operacion($1,$3,'^');}
| EXP '%' EXP {$$=new Operacion($1,$3,'%');}
| '-' EXP %prec UMENOS {$$=new Negativo($2);}
;
EXPOP : EXP '&&' EXP {$$=new Operador($1,$3,'&&');}
| EXP '||' EXP {$$=new Operador($1,$3,'||');}
| '!' EXP {$$=new Negacion($2);}
;
EXPREL : EXP '==' EXP {$$ = new Relacional($1,$3,'IGUAL_IGUAL');}
| EXP '!=' EXP {$$ = new Relacional($1,$3,'DIFERENTE_IGUAL');}
| EXP '<' EXP {$$ = new Relacional($1,$3,'MENOR');}
| EXP '<=' EXP {$$ = new Relacional($1,$3,'MENOR_IGUAL');}
| EXP '>' EXP {$$ = new Relacional($1,$3,'MAYOR');}
| EXP '>=' EXP {$$ = new Relacional($1,$3,'MAYOR_IGUAL');}
;
EXPTER : EXP '?' EXP ':' EXP {$$ = new Ternario($1,$3,$5);}
;
VALORES_LIST : VALORES_LIST ',' VALORES {$1.push($3);$$ = $1;}
| VALORES {$$ = [$1];}
;
VALORES : Tx_Integer {$$=new Valor("int",$1);}
| Tx_Double {$$=new Valor("double",$1);}
| Tx_Boolean {$$=new Valor("boolean",$1);}
| Tx_Char {$$=new Valor("char",$1);}
| Tx_String {
    var text = $1.substr(0,$1.length);
    text=text.replace(/\\n/g,"\n");
    text=text.replace(/\\t/g,"\t");
    text=text.replace(/\\r/g,"\r");
    text=text.replace(/\\\\/g,"\\");
    text=text.replace(/\\\"/g,"\"");
    text=text.replace(/['"]+/g, '');
    $$=new Valor("string",text);
}
;