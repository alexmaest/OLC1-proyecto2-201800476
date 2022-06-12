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
                        //allError.listErrores().addError(new lexicError("Error: Valor no valido de forma léxica \"" + yytext + "\"",yylloc.first_line,yylloc.first_column));
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

INICIO : INSTRUCCIONES_G EOF {try{console.log("Arbol generado");return $1;}catch(e){console.log("Se han producido errores en el análisis del arbol");}}
;
INSTRUCCIONES_G : INSTRUCCIONES_G INSTRUCCION_G {$1.push($2);$$ = $1;}
| INSTRUCCION_G {$$ = [$1];}
| error
;
INSTRUCCION_G : TIPO_VAR VARIABLE ';'{$$=new singleNode(this._$.first_line,@1.last_column,"VARIABLE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
| FUNCION {$$=$1;}
| RUN {$$=$1;}
| IMPRIMIR {$$=$1;}
;
RUN : 'run' Tx_Id '(' ')' ';' {$$=new singleNode(this._$.first_line,@1.last_column,"RUN");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'run' Tx_Id '(' EXP_LIST ')' ';' {$$=new singleNode(this._$.first_line,@1.last_column,"RUN");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
;
IMPRIMIR : 'print' '(' EXP ')' ';' {$$=new singleNode(this._$.first_line,@1.last_column,"IMPRIMIR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'println' '(' EXP ')' ';' {$$=new singleNode(this._$.first_line,@1.last_column,"IMPRIMIR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
;
EXP_LIST : EXP_LIST ',' EXP {$1.push($3);$$ = $1;}
| EXP {$$ = [$1];}
;
FUNCION : Tx_Id '(' PARAMETROS ')' ':' TIPO_VAR BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FUNCION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,":"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$7));}
| Tx_Id '(' ')' ':' TIPO_VAR BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FUNCION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,":"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));}
| Tx_Id '(' PARAMETROS ')' BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FUNCION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));}
| Tx_Id '(' ')' BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FUNCION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));}
;
PARAMETROS : PARAMETROS ',' TIPO_VAR Tx_Id {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));
$1.addNode(new singleNode(this._$.first_line,@1.last_column,$4));$$ = $1;}
| PARAMETROS ',' TIPO_VAR '[' ']' Tx_Id {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));
$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$6));$$ = $1;}
| PARAMETROS ',' TIPO_VAR '[' ']' '[' ']' Tx_Id {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));
$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$8));$$ = $1;}
| TIPO_VAR '[' ']' Tx_Id {$$=new singleNode(this._$.first_line,@1.last_column,"PARAMETRO");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"))}
| TIPO_VAR '[' ']' '[' ']' Tx_Id {$$=new singleNode(this._$.first_line,@1.last_column,"PARAMETRO");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
| TIPO_VAR Tx_Id {$$=new singleNode(this._$.first_line,@1.last_column,"PARAMETRO");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
;
INSTRUCCIONES_L : INSTRUCCIONES_L INSTRUCCION_L {$1.push($2);$$ = $1;}
| INSTRUCCION_L {$$ = [$1];}
| error 
;
INSTRUCCION_L : TIPO_VAR VARIABLE ';' {$$=new singleNode(this._$.first_line,@1.last_column,"VARIABLE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
| ASIGNACION ';' {$$=$1;}
| LLAMADA_F ';' {$$=$1;}
| SENTENCIAS {$$=$1;}
| TRANSFERENCIA ';' {$$=$1;}
| IMPRIMIR {$$=$1;}
;
TRANSFERENCIA : 'break' {$$=new singleNode(this._$.first_line,@1.last_column,"TRANSFERENCIA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"break"));}
| 'return' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"TRANSFERENCIA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"return"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
| 'return' {$$=new singleNode(this._$.first_line,@1.last_column,"TRANSFERENCIA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"return"));}
| 'continue'  {$$=new singleNode(this._$.first_line,@1.last_column,"TRANSFERENCIA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"continue"));}
;
SENTENCIAS : IF {$$=$1;}
| SWITCH {$$=$1;}
| WHILE {$$=$1;}
| FOR {$$=$1;}
| DOWHILE {$$=$1;}
;
IF : 'if' '(' EXP ')' BLOQUE ELSE {$$=new singleNode(this._$.first_line,@1.last_column,"IF");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"if"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));}
;
ELSE :'else' BLOQUE{$$ = $2;}
| 'else' IF {$$ = $2;}
| /*epsilon*/ {$$ = null;}
;
SWITCH : 'switch' '(' EXP ')' BLOQUE_SWITCH {$$=new singleNode(this._$.first_line,@1.last_column,"SWITCH");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"switch"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));}
;
CASE_LIST : CASE_LIST 'case' EXP ':' INSTRUCCIONES_L {$1.addNode(new singleNode(this._$.first_line,@1.last_column,"case"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));
$1.addNode(new singleNode(this._$.first_line,@1.last_column,":"));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$5));$$=$1;}
| 'case' EXP ':' INSTRUCCIONES_L {$$=new singleNode(this._$.first_line,@1.last_column,"CASE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"case"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,":"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));}
;
DEFAULT : 'default' ':' INSTRUCCIONES_L {$$=new singleNode(this._$.first_line,@1.last_column,"DEFAULT");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"default"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,":"));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
;
WHILE : 'while' '(' EXP ')' BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"WHILE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"while"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));}
;
FOR : 'for' '(' TIPO_VAR VARIABLE ';' EXPREL ';' ASIGNACION ')' BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"for"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$8));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'for' '(' ASIGNACION ';' EXPREL ';' ASIGNACION ')' BLOQUE {$$=new singleNode(this._$.first_line,@1.last_column,"FOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"for"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$7));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$9));}
;
DOWHILE : 'do' BLOQUE 'while' '(' EXP ')' ';'  {$$=new singleNode(this._$.first_line,@1.last_column,"DOWHILE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"do"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"while"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
;
BLOQUE_SWITCH : '{' CASE_LIST DEFAULT '}' {$2.push($3);$$ = $2;}
| '{' CASE_LIST '}' {$$ = $2;}
| '{' DEFAULT '}' {$$ = [$2];}
;
BLOQUE : '{' '}' {$$=new singleNode(this._$.first_line,@1.last_column,"BLOQUE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"{"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"}"));}
| '{' INSTRUCCIONES_L '}' {$$=new singleNode(this._$.first_line,@1.last_column,"BLOQUE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"{"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"}"));}
;
LLAMADA_F : Tx_Id '(' ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| Tx_Id '(' EXP_LIST ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'tolower' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'toupper' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'round' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'length' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'typeof' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'tostring' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
| 'tochararray' '(' EXP ')' {$$=new singleNode(this._$.first_line,@1.last_column,"LLAMADA");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));}
;
VARIABLE : VARIABLE ',' ASIGNACION {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$ = $1;}
| VARIABLE ',' Tx_Id {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$ = $1;}
| VARIABLE ',' Tx_Id '[' ']' {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$ = $1;}
| VARIABLE ',' Tx_Id '[' ']' '[' ']' {$1.addNode(new singleNode(this._$.first_line,@1.last_column,","));$1.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));
$1.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$1.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$ = $1;}
| ASIGNACION {$$ = [$1];}
| Tx_Id {$$=new singleNode(this._$.first_line,@1.last_column,"VARIABLE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_Id '[' ']' {$$=new singleNode(this._$.first_line,@1.last_column,"VARIABLE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
| Tx_Id '[' ']' '[' ']' {$$=new singleNode(this._$.first_line,@1.last_column,"VARIABLE");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
;
ASIGNACION: Tx_Id '=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"="));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| Tx_Id '[' ']' '=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"="));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));}
| Tx_Id '[' ']' '[' ']' '=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"="));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$7));}
| Tx_Id '[' EXP ']' '=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));}
| Tx_Id '[' EXP ']' '[' EXP ']' '=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$9));}
| Tx_Id '++' {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"++"));}
| Tx_Id '--' {$$=new singleNode(this._$.first_line,@1.last_column,"ASIGNACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"--"));}
;
TIPO_VAR : 'int' {$$=$1;}
| 'double' {$$=$1;}
| 'boolean' {$$=$1;}
| 'char' {$$=$1;}
| 'string' {$$=$1;}
| 'void' {$$=$1;}
;
EXP : EXPMATH {$$=$1;}
| EXPOP {$$=$1;}
| EXPREL {$$=$1;}
| EXPTER {$$=$1;}
| LLAMADA_F {$$=$1;}
| '(' TIPO_VAR ')' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"EXP");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"("));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,")"));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));}
| '(' EXP ')' {$$=$2;}
| ARRAY {$$=$1;}
| VALORES {$$=$1;}
| Tx_Id {$$=new singleNode(this._$.first_line,@1.last_column,"EXP");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_Id '++' {$$=new singleNode(this._$.first_line,@1.last_column,"EXP");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"++"));}
| Tx_Id '--' {$$=new singleNode(this._$.first_line,@1.last_column,"EXP");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"--"));}
;
ARRAY : 'new' TIPO_VAR '[' EXP ']' {$$=new singleNode(this._$.first_line,@1.last_column,"ARRAY");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"new"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$4));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
| 'new' TIPO_VAR '[' EXP ']' '[' EXP ']' 
| '[' EXP_LIST ']' {$$=new singleNode(this._$.first_line,@1.last_column,"ARRAY");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
| Tx_Id '[' EXP ']' {$$=new singleNode(this._$.first_line,@1.last_column,"ARRAY");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
| Tx_Id '[' EXP ']' '[' EXP ']' {$$=new singleNode(this._$.first_line,@1.last_column,"ARRAY");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));
$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"["));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$6));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"]"));}
;
EXPMATH : EXP '+' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"+"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '-' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"-"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '/' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"/"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '*' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"*"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '^' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"^"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '%' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"%"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| '-' EXP %prec UMENOS  {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"-"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
;
EXPOP : EXP '&&' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACIONAL");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"&&"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '||' EXP  {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACIONAL");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"||"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| '!' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"OPERACIONAL");$$.addNode(new singleNode(this._$.first_line,@1.last_column,"!"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$2));}
;
EXPREL : EXP '==' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"=="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '!=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"!="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '<' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"<"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '<=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"<="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '>' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,">"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
| EXP '>=' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"RELACION");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,">="));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$3));}
;
EXPTER : EXP '?' EXP ':' EXP {$$=new singleNode(this._$.first_line,@1.last_column,"TERNARIO");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));$$.addNode(new singleNode(this._$.first_line,@1.last_column,"?"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,":"));$$.addNode(new singleNode(this._$.first_line,@1.last_column,$5));}
;
VALORES_LIST : VALORES_LIST ',' VALORES {$1.push($3);$$ = $1;}
| VALORES {$$ = [$1];}
;
VALORES : Tx_Integer {$$=new singleNode(this._$.first_line,@1.last_column,"VALOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_Double {$$=new singleNode(this._$.first_line,@1.last_column,"VALOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_Char {$$=new singleNode(this._$.first_line,@1.last_column,"VALOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_String {$$=new singleNode(this._$.first_line,@1.last_column,"VALOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
| Tx_Boolean {$$=new singleNode(this._$.first_line,@1.last_column,"VALOR");$$.addNode(new singleNode(this._$.first_line,@1.last_column,$1));}
;