//Definir el codigo
// Todo codigo javascript, que necesitemos incluir
%{
%}

%lex
%options case-insensitive

%%

\s+             // se ignoran los espacios en blanco
\/\/[^\n]*          // comentarios de simple linea

//Palabras reservadas

"int"                return 'int'
"double"             return 'double'
"boolean"            return 'boolean'
"char"               return 'char'
"string"             return 'string'
"new"                return 'new'
"if"                 return 'if'
"else if"            return 'else if'
"else"               return 'else'
"print"              return 'print'
"println"            return 'println'

//Simbolos

";"                 return ';'
","                 return ','
"="                 return '='
"["                 return '['
"]"                 return ']'
"{"                 return '{'
"}"                 return '}'
"("                 return '('
")"                 return ')'
"<"                 return '<'
">"                 return '>'
"<="                return '<='
">="                return '>='
"||"                return '||'
"&&"                return '&&'
"!"                 return '!'

//Expresiones regulares

(true|false)                                return 'Tx_Boolean';
\"[^\"]*\"                                  return 'Tx_String';
[0-9]+                                      return 'Tx_Integer';
[A-Za-zÑñ]+[0-9_]*                          return 'Tx_Id';
[0-9]+\.[0-9]+                              return 'Tx_Double';
(\'[^'\\]\')                                return 'Tx_Char';
//(\'[^'\\]\')|(\'(\\\\|\\n|\\t|\\r|\\")\')   return 'Tx_Char';

<<EOF>>				return 'EOF';
.					{
                        console.error('Este es un error léxico: ' + yytext + ', en la linea: ' + yylloc.first_line + ', en la columna: ' + yylloc.first_column);
                        L_Error.getInstance().insertar(new N_Error("Lexico","Caracter: \" "+yytext+"\" no es valido" ,yylloc.first_line,yylloc.first_column));
                        return null; 
                    }

/lex

%start INICIO

%%

//Inicio-Fin
INICIO : INSTRUCCIONES EOF{$$ = new Instruccion("RAIZ",new Unknown(""));$$.addChild($1);return $$;}
;
//Instrucciones
INSTRUCCIONES : INSTRUCCIONES INSTRUCCION {$1.addChild($2);$$ = $1;}
| INSTRUCCION {$$ = new Instruccion("INSTRUCCION",new Unknown(""));$$.addChild($1);}
;
INSTRUCCION : DECLARACION ';' {$$ = $1;}
| IMPRIMIR ';' {$$ = $1;}
| CONDICIONAL {$$ = $1;}
;
//Declaracion de variables
DECLARACION : TIPO_VAR DECLARACION_VAR {$$ = new Instruccion("DECLARACION_VAR",new Declaration($1,$2));}
| TIPO_VAR DECLARACION_ARR {$$ = new Instruccion("DECLARACION_ARR",new Declaration($1,$2));}
;
DECLARACION_VAR : DECLARACION_VAR ',' Tx_Id {$1.push($3);$$ = $1;}
| DECLARACION_VAR ',' Tx_Id '=' VAL_VAR {$1.push(new Variable($3,$5));$$ = $1;}
| Tx_Id '=' VAL_VAR {$$=[];$$.push(new Variable($1,$3));}
| Tx_Id {$$=[];$$.push($1);}
;
DECLARACION_ARR : Tx_Id '[' ']' '=' new TIPO_VAR '[' Tx_Integer ']' {var single = [];single.push($1);single.push($6);single.push($8);$$ = new Array("TIPO1",single);}
| Tx_Id '[' ']' '[' ']' '=' new TIPO_VAR '[' Tx_Integer ']' '[' Tx_Integer ']' {var single = [];single.push($1);single.push($8);single.push($10);single.push($13);$$ = new Array("TIPO2",single);}
| Tx_Id '[' ']' '=' '[' ARR_LIST ']' {var single = [];single.push($1);single.push($6);$$ = new Array("TIPO3",single);}
| Tx_Id '[' ']' '[' ']' '=' '[' '[' ARR_LIST ']' ',' '[' ARR_LIST ']' ']' {var single = [];single.push($1);single.push($9);single.push($13);$$ = new Array("TIPO4",$1,$9,$13);}
;
ARR_LIST : ARR_LIST ',' VAL_VAR {$1.push($3);$$=$1;}
| VAL_VAR {$$=[];$$.push($1);}
;
TIPO_VAR : 'int' {$$ = $1;}
| 'double' {$$ = $1;}
| 'boolean' {$$ = $1;}
| 'char' {$$ = $1;}
| 'string' {$$ = $1;}
;
VAL_VAR : Tx_Integer{$$ = new Instruccion("int",$1);}
| Tx_Double{$$ = new Instruccion("double",$1);}
| Tx_Boolean{$$ = new Instruccion("boolean",$1);}
| Tx_Char{$$ = new Instruccion("char",$1);}
| Tx_String{$$ = new Instruccion("string",$1);}
;
//Imprimir
IMPRIMIR : 'print' '(' VAL_VAR ')' {$$ = new Instruccion("IMPRIMIR",new Print($3));}
| 'println' '(' VAL_VAR ')' {$$ = new Instruccion("IMPRIMIRLN",new Print($3));}
;
//Condicionales
CONDICIONAL : 'if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' {var single=[];$$ = new Instruccion("CONDICIONAL",new Conditional("TIPO1",$3,$6,single));}
| 'if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' CONDICIONAL_ELIF {$$ = new Instruccion("CONDICIONAL",new Conditional("TIPO2",$3,$6,$8));}
| 'if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' 'else' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' {var single=[];single.push($10);single.push($13);$$ = new Instruccion("CONDICIONAL",new Conditional("TIPO3",$3,$6,single));}
| 'if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' CONDICIONAL_ELIF 'else' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' {var single=[];single.push($8);single.push($11);single.push($14);$$ = new Instruccion("CONDICIONAL",new Conditional("TIPO4",$3,$6,single));}
;
CONDICIONAL_ELIF : CONDICIONAL_ELIF 'else if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' {$1.push(new Condition($2,$4,$7));$$=$1;}
| 'else if' '(' CONDICIONAL_OP ')' '{' INSTRUCCIONES '}' {$$=[];$$.push(new Condition($1,$3,$6));}
;
CONDICION : CONDICION_VAR '==' CONDICION_VAR{$$ = new Condition($1,$2,$3);}
| CONDICION_VAR '<=' CONDICION_VAR{$$ = new Condition($1,$2,$3);}
| CONDICION_VAR '>=' CONDICION_VAR{$$ = new Condition($1,$2,$3);}
| CONDICION_VAR '<' CONDICION_VAR{$$ = new Condition($1,$2,$3);}
| CONDICION_VAR '>' CONDICION_VAR{$$ = new Condition($1,$2,$3);}
| '!' CONDICION_VAR{$$ = new Negation($2);}
| CONDICION_VAR {$$ = $1;}
;
CONDICION_VAR : VAL_VAR {$$ = $1;}
| Tx_Id {$$ = $1;}
;
CONDICIONAL_OP : CONDICIONAL_OP CONDICION '||' CONDICION{$1.push(new Condition($2,$3,$4));$$=$1;}
| CONDICIONAL_OP CONDICION '&&' CONDICION{$1.push(new Condition($2,$3,$4));$$=$1;}
| CONDICION '||' CONDICION{$$=[];$$.push(new Condition($1,$2,$3));}
| CONDICION '&&' CONDICION{$$=[];$$.push(new Condition($1,$2,$3));}
;