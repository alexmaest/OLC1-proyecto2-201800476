class Interprete {

  constructor() {
    this.variablesGlobales = [];
    this.funciones = [];
    this.bloques = [];
    this.consoleText = '';
  }

  analize(node) {
    if (node === undefined || node === null) return;
    for (let i = 0; i < node.length; i++) {
      if (node[i] instanceof Variable) {
        if (node[i].tipo_dec === "NORMAL") {
          //console.log("Hola con Variable normal");
        } else if (node[i].tipo_dec === "SINGLE_ARRAY") {
          //console.log("Hola con arreglo");
        } else if (node[i].tipo_dec === "DOUBLE_ARRAY") {
          //console.log("Hola con arreglo doble");
        } else {
          //console.log("Hola con Asignacion");
        }
      } else if (node[i] instanceof Llamada) {
        console.log(node[i]);
        if(node[i].tipo === 'RUN'){
          for (let j = 0; j < node.length; j++) {
            if (node[j] instanceof Funcion) {
              if(node[i].id === node[j].id){
                let tempArguments = [];
                for(let l = 0; l < node[j].parametros.length; l++){
                  tempArguments.push(new VariableRun(node[j].parametros[l].tipo_dec,node[j].parametros[l].id,null,'variable'));
                }
                this.bloques.push(new BloqueRun(node[j].id,node[j].fila,node[j].columna,tempArguments,[],node[j].parametros));
                for (let l = 0; l < node[j].bloque.Instrucciones.length; l++) {
                  this.runInstructions(node[j].id,node[j].fila,node[j].columna,node[j].bloque.Instrucciones[l],this.bloques);
                }
              }else{continue;}
            }else{continue;}
          }
        }
      } else if (node[i] instanceof Funcion) {
        /*if (this.foundFunction(node[i].id,node[i].fila,node[i].columna,this.bloques) !== null) {
          console.log("Error: Función " + node[i].id + " ya ha sido declarada");
        } else {
          let tempArguments = [];
          for(let j = 0; j < node[i].parametros.length; j++){
            tempArguments.push(new VariableRun(node[i].parametros[j].tipo_dec,node[i].parametros[j].id,null,'variable'));
          }
          this.bloques.push(new BloqueRun(node[i].id,node[i].fila,node[i].columna,tempArguments,[],node[i].parametros));
          for (let j = 0; j < node[i].bloque.Instrucciones.length; j++) {
            this.runInstructions(node[i].id,node[i].fila,node[i].columna,node[i].bloque.Instrucciones[j],this.bloques);
          }
        }*/
      } else if (node[i] instanceof Imprimir) {
        if(instruction === 'print'){
          this.consoleText += this.printText(node[i].valor,blockRow,blockCol,blockArray); 
        }else{
          this.consoleText += this.printText(node[i].valor,blockRow,blockCol,blockArray) + "\n";
        }
      } else{continue;}
    }
  }

  runInstructions(blockId,blockRow,blockCol,instruction,blockArray) {
    let blockFound = this.foundFunction(blockId,blockRow,blockCol,blockArray);
    //console.log(blockFound);
    if (instruction instanceof Variable) {
        if (instruction.tipo_dec === "NORMAL") {
          let found = null;
          for (let i = 0; i < blockArray.length; i++) {
            if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value[0].valor,blockRow,blockCol) !== null){
              found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value[0].valor,blockRow,blockCol);
              break;
            }
          }
          if (found === null) {
            let newVariable = new VariableRun(instruction.tipo_var, instruction.value[0].valor, null, 'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          }else{
            console.log("Error: La variable " + instruction.tipo_var[0].valor + " ya ha sido declarada anteriormente");
          }
        } else if (instruction.tipo_dec === "SINGLE_ARRAY") {
          let found = null;
          for (let i = 0; i < blockArray.length; i++) {
            if(this.foundVariable(blockArray[i],[],instruction.value[0].valor,blockRow,blockCol) !== null){
              found = this.foundVariable(blockArray[i],[],instruction.value[0].valor,blockRow,blockCol);
              break;
            }
          }
          if (found === null) {
            let newVariable = new VariableRun(instruction.tipo_var, instruction.value[0].valor, null, 'array');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          }else{
            console.log("Error: La variable " + instruction.tipo_var[0].valor + " ya ha sido declarada anteriormente");
          }
        } else if (instruction.tipo_dec === "DOUBLE_ARRAY") {
          let found = null;
          for (let i = 0; i < blockArray.length; i++) {
            if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value[0].valor,blockRow,blockCol) !== null){
              found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value[0].valor,blockRow,blockCol);
              break;
            }
          }
          if (found === null) {
            let newVariable = new VariableRun(instruction.tipo_var, instruction.value[0].valor, null, 'array_doble');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          }else{
            console.log("Error: La variable " + instruction.tipo_var[0].valor + " ya ha sido declarada anteriormente");
          }
        } else {
          let found = null;
          for (let i = 0; i < blockArray.length; i++) {
            if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.tipo_var[0].valor,blockRow,blockCol) !== null){
              found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.tipo_var[0].valor,blockRow,blockCol);
              break;
            }
          }
          //console.log(found);
          if (found === null) {
            if (instruction.value instanceof OperacionSimplificada) {
              if(found !== null){
                if(found.valor !== null){
                  if (found.tipo === "int" || found.tipo === "double") {
                    if (instruction.value.tipo === "++") {
                      found.valor = found.valor + 1;
                    } else {
                      found.valor = found.valor - 1;
                    }
                  } else {
                    console.log(
                      "Error en aumentar cantidad en una variable no numérica"
                    );
                  }
                }else{
                  console.log("Error: La variable a la que le quiere cambiar su valor es nula, debe inicializarla");
                }
              }else{
                console.log("Error: La variable a la que le quiere cambiar su valor no existe");
              }
            } else {
              //Asignacion
              if (instruction.value.tipo_asg === "NORMAL") {
                if (instruction.value.value instanceof Operacion) {
                  if(instruction.tipo_var === 'int' || instruction.tipo_var === 'double'){
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, this.arithmetic(instruction.value.value),'variable');
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  }else if(instruction.tipo_var === 'string'){
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, this.printText(instruction.value.value),'variable');
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  } else{
                    console.log("Error: Está intentando asignar contenidos de tipo incorrectos en variables");
                  }
                } else if(instruction.value.value instanceof Negativo) {
                  if(instruction.tipo_var === 'int' || instruction.tipo_var === 'double'){
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, this.arithmetic(instruction.value.value),'variable');
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  } else{
                    console.log("Error: Solo puede asignar valores numéricos a variables numéricas");
                  }
                } else if(instruction.value.value instanceof Valor){
                  if(instruction.value.value.tipo === instruction.tipo_var){
                    let valueToAssign = null;
                    if(instruction.tipo_var === 'int'){valueToAssign = parseInt(instruction.value.value.valor);}
                    else if(instruction.tipo_var === 'string' || instruction.tipo_var === 'char'){valueToAssign = instruction.value.value.valor.toString();}
                    else if(instruction.tipo_var === 'boolean'){valueToAssign = (instruction.value.value.valor === 'true');}
                    else if(instruction.tipo_var === 'double'){valueToAssign = parseFloat(instruction.value.value.valor);}
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, valueToAssign, 'variable');
                    //console.log(blockFound);
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  } else{
                    console.log("El valor asignado no corresponde con el tipo de variable");
                  }
                } else if(instruction.value.value instanceof OperacionSimplificada){
                  let found2 = null;
                  for (let i = 0; i < blockArray.length; i++) {
                    if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol) !== null){
                      found2 = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol);
                      break;
                    }
                  }
                  if(found2 !== null){
                    if (instruction.tipo_var === "int" || instruction.tipo_var === "double") {
                      if (found2.tipo === "int" || instruction.tipo === "double") {
                        if (instruction.value.value.tipo === "++") {
                          instruction.value.value = found2.valor + 1;
                        } else {
                          instruction.value.value = found2.valor - 1;
                        }
                        let newVariable = new VariableRun(instruction.tipo_var, instruction.value.value.tipo_var[0].valor, instruction.value.value,'variable');
                        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                      } else {
                        console.log("Error: La variable que llamó para aumentar el valor no es numérica");
                      }
                    } else {
                    console.log("Error: La variable en la que desea aumentar el valor no es numérica");
                    }
                  }else{
                    console.log("Error: El id " + instruction.value.value.valor + " no existe");
                  }
                } else if(instruction.value.value instanceof Casteo){
                  let found2 = null;
                  for (let i = 0; i < blockArray.length; i++) {
                    if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor.valor,blockRow,blockCol) !== null){
                      found2 = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor.valor,blockRow,blockCol);
                      break;
                    }
                  }
                  if(found2 !== null){
                    if (instruction.tipo_var === instruction.value.value.tipo) {
                      //int a string
                      if(instruction.value.value.tipo === 'string' && found2.tipo === 'int'){
                        let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, found2.valor.toString(),'variable');
                        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                        console.log("Variable casteada de int a string");
                      //int a double
                      } else if(instruction.value.value.tipo === 'double' && found2.tipo === 'int'){
                        let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor,(found2.valor).toFixed(1),'variable');
                        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                        console.log("Variable casteada de int a double");
                      //double a int
                      } else if(instruction.value.value.tipo === 'int' && found2.tipo === 'double'){
                        let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor,parseInt(found2.valor, 10),'variable');
                        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                        console.log("Variable casteada de double a int");
                      //double a string
                    } else if(instruction.value.value.tipo === 'string' && found2.tipo === 'double'){
                      let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor,found2.valor.toString(),'variable');
                      this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                      console.log("Variable casteada de double a string");
                    }
                    } else {
                      console.log("Error: Quiere asignar un casteo de una variable tipo " + instruction.value.value.tipo + " en una tipo " + instruction.tipo_var);
                    }
                  }else{
                    console.log("Error: El id " + instruction.value.value.valor + " no existe");
                  }
                } else if(instruction.value.value instanceof nuevoArraySimple){
                  console.log("Error: No puede asignar un vector simple a una variable normal");
                } else if(instruction.value.value instanceof nuevoArrayDoble){
                  console.log("Error: No puede asignar un vector doble a una variable normal");
                } else if(instruction.value.value instanceof NuevoArray){
                  console.log("Error: No puede asignar una lista a una variable normal");
                } else if(instruction.value.value instanceof AccesoArraySimple){
                } else if(instruction.value.value instanceof AccesoArrayDoble){
                } else if(instruction.value.value instanceof Operador){
                  console.log("Error: No puede asignar un operador a una variable");
                } else if(instruction.value.value instanceof Negacion){
                  console.log("Error: No puede asignar un operador a una variable");
                } else if(instruction.value.value instanceof Relacional){
                  console.log("Error: No puede asignar una relación a una variable");
                } else if(instruction.value.value instanceof Id){
                  let found2 = null;
                  for (let i = 0; i < blockArray.length; i++) {
                    if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol) !== null){
                      found2 = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol);
                      break;
                    }
                  }
                  if(found2 !== null){
                    if(found2.tipo === instruction.tipo_var){
                      let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, found2.valor,'variable');
                      this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                    }else{
                      console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + instruction.tipo_var);
                    }
                  }else{
                    console.log("Error: El id " + instruction.value.value.valor + " no existe");
                  }
                }
              } else if (instruction.value.tipo_asg === "SINGLE_ARRAY") {
                if (instruction.value.value instanceof Operacion) {
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Negativo) {
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Valor){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof OperacionSimplificada){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Casteo){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof nuevoArraySimple){
                  if(instruction.tipo_var === instruction.value.value.tipo){
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, this.fillDefaultArray(instruction.tipo_var,instruction.value.value.expresion.valor),'array');
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  } else{
                    console.log("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + instruction.tipo_var);
                  }
                } else if(instruction.value.value instanceof nuevoArrayDoble){
                  console.log("Error: No puede asignar un vector doble a un vector simple");
                } else if(instruction.value.value instanceof NuevoArray){
                } else if(instruction.value.value instanceof AccesoArraySimple){
                } else if(instruction.value.value instanceof AccesoArrayDoble){
                } else if(instruction.value.value instanceof Operador){
                  console.log("Error: No puede asignar un operador a un vector");
                } else if(instruction.value.value instanceof Negacion){
                  console.log("Error: No puede asignar un operador a una vector");
                } else if(instruction.value.value instanceof Relacional){
                  console.log("Error: No puede asignar una relación a una vector");
                } else if(instruction.value.value instanceof Id){
                  let found2 = null;
                  for (let i = 0; i < blockArray.length; i++) {
                    if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol) !== null){
                      found2 = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol);
                      break;
                    }
                  }
                  if(found2 !== null){
                    if(found2.tipo === instruction.tipo_var){
                      let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, found2.valor,'variable');
                      this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                    }else{
                      console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + instruction.tipo_var);
                    }
                  }else{
                    console.log("Error: El id " + instruction.value.value.valor + " no existe");
                  }
                }
              } else if (instruction.value.tipo_asg === "DOUBLE_ARRAY") {
                if (instruction.value.value instanceof Operacion) {
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Negativo) {
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Valor){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof OperacionSimplificada){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof Casteo){
                  console.log("Error: No puede asignar un solo valor a un vector");
                } else if(instruction.value.value instanceof nuevoArraySimple){
                  console.log("Error: No puede asignar un vector simple a un vector doble");
                } else if(instruction.value.value instanceof nuevoArrayDoble){
                  if(instruction.tipo_var === instruction.value.value.tipo){
                    let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, this.fillDefaultArray(instruction.tipo_var,instruction.value.value.expresion1.valor) ,'array');
                    this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                  } else{
                    console.log("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + instruction.tipo_var);
                  }
                } else if(instruction.value.value instanceof NuevoArray){
                  console.log("Error: No puede asignar una lista a un vector doble");
                } else if(instruction.value.value instanceof AccesoArraySimple){
                } else if(instruction.value.value instanceof AccesoArrayDoble){
                } else if(instruction.value.value instanceof Operador){
                  console.log("Error: No puede asignar un operador a un vector");
                } else if(instruction.value.value instanceof Negacion){
                  console.log("Error: No puede asignar un operador a una vector");
                } else if(instruction.value.value instanceof Relacional){
                  console.log("Error: No puede asignar una relación a una vector");
                } else if(instruction.value.value instanceof Id){
                  let found2 = null;
                  for (let i = 0; i < blockArray.length; i++) {
                    if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol) !== null){
                      found2 = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.value.value.valor,blockRow,blockCol);
                      break;
                    }
                  }
                  if(found2 !== null){
                    if(found2.tipo === instruction.tipo_var){
                      let newVariable = new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0].valor, found2.valor,'variable');
                      this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
                    }else{
                      console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + instruction.tipo_var);
                    }
                  }else{
                    console.log("Error: El id " + instruction.value.value.valor + " no existe");
                  }
                }
              }
            }
          }else{
            console.log("Error: La variable " + instruction.value.tipo_var[0].valor + " ya ha sido declarada anteriormente");
          }
        }
    } else if (instruction instanceof Asignacion) {
      let found = null;
      for (let i = 0; i < blockArray.length; i++) {
        if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.tipo_var[0].valor,blockRow,blockCol) !== null){
          found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.tipo_var[0].valor,blockRow,blockCol);
          break;
        }
      }
      if (found !== null) {
        if(instruction.tipo_asg === 'NORMAL'){
          if(instruction.value.tipo === found.tipo){
            let valueToAssign = instruction.value;
            if(found.tipo === 'int'){valueToAssign = parseInt(instruction.value);}
            else if(found.tipo === 'string' || found.tipo === 'char'){valueToAssign = instruction.value.toString();}
            else if(found.tipo === 'boolean'){valueToAssign = (instruction.value === 'true');}
            else if(found.tipo === 'double'){valueToAssign = parseFloat(instruction.value);}
            found.valor = valueToAssign;
          } else{
            console.log("El valor asignado no corresponde con el tipo de variable");
          }
        } else if(instruction.tipo_asg === 'SINGLE_ARRAY'){
        } else if(instruction.tipo_asg === 'DOUBLE_ARRAY'){
        }
      }else{
        console.log("Error: La variable " + instruction.tipo_var[0].valor + " aún no se ha declarado");
      }
    } else if (instruction instanceof OperacionSimplificada) {
      let found = null;
      for (let i = 0; i < blockArray.length; i++) {
        if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.valor,blockRow,blockCol) !== null){
          found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.valor,blockRow,blockCol);
          break;
        }
      }
      if (found !== null) {
        if (found.tipo === "int" || found.tipo === "double") {
          if (instruction.tipo === "++") {
            found.valor = found.valor + 1;
          } else {
            found.valor = found.valor - 1;
          }
        } else {
          console.log("Error: La variable a la que quiere cambiar su cantidad, no es numérica");
        }
      }else{
        console.log("Error: La variable a la que le quiere cambiar el valor, aún no está declarada");
      }
    } else if (instruction instanceof Llamada) {
      if(this.foundFunction(instruction.id)){
        let returned = this.returnFunction(instruction.id);
        console.log(returned.id);
        returned.llamadas.push(new LlamadaRun(instruction.id,instruction.parametros));
      } else{
        console.log("Intenta llamar una función no definida llamada " + instruction.id);
      }
    } else if (instruction instanceof If) {
      console.log(instruction.condicion);
      if(this.relational(instruction.condicion,blockRow,blockCol,blockArray)){
        let newBlock = new BloqueRun('if',instruction.fila,instruction.columna,[],[],[]);
        this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
          let returned = this.runInstructions('if',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
          if(returned instanceof Break){
            return returned;
          }else if(returned instanceof Continue){
            return returned;
          }else{continue;}
        }
      }else{
        if(instruction.Else !== null){
          if(instruction.Else instanceof If){
            this.runInstructions(blockId,blockRow,blockCol,instruction.Else,blockArray);
          }else if(instruction.Else instanceof Bloque){
            let newBlock = new BloqueRun('else',instruction.Else.fila,instruction.Else.columna,[],[],[]);
            this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
            for (let i = 0; i < instruction.Else.Instrucciones.length; i++) {
              let returned = this.runInstructions('else',instruction.Else.fila,instruction.Else.columna,instruction.Else.Instrucciones[i],blockArray);
              if(returned instanceof Break){
                return returned;
              }else if(returned instanceof Continue){
                return returned;
              }else{continue;}
            }
          }
        }
      }
    } else if (instruction instanceof For) {
      console.log(instruction);
      let newBlock = new BloqueRun('for',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
      if(instruction.variable instanceof Variable){
        if(instruction.variable.tipo_dec === 'ASIGNACION'){
          let found = null;
          for (let i = 0; i < blockArray.length; i++) {
            if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.variable.value.tipo_var[0].valor,blockRow,blockCol) !== null){
              found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.variable.value.tipo_var[0].valor,blockRow,blockCol);
              break;
            }
          }
          if(found === null){
            if(instruction.variable.value.value instanceof Valor){
              if(instruction.variable.value.value.tipo === instruction.variable.tipo_var){
                let valueToAssign = null;
                if(instruction.variable.tipo_var === 'int'){valueToAssign = parseInt(instruction.variable.value.value.valor);}
                else if(instruction.variable.tipo_var === 'string' || instruction.variable.tipo_var === 'char'){valueToAssign = instruction.variable.value.value.valor.toString();}
                else if(instruction.variable.tipo_var === 'boolean'){valueToAssign = (instruction.variable.value.value.valor === 'true');}
                else if(instruction.variable.tipo_var === 'double'){valueToAssign = parseFloat(instruction.variable.value.value.valor);}
                let newVariable = new VariableRun(instruction.variable.tipo_var, instruction.variable.value.tipo_var[0].valor, valueToAssign, 'variable');
                this.addVariable(blockArray,instruction.fila,instruction.columna,newVariable);
              } else{
                console.log("Error: El valor asignado no corresponde con el tipo de variable");
              }
            }
          }else{
            console.log("Error: La variable " + instruction.variable.value.tipo_var[0].valor + " ya ha sido declarada anteriormente");
          }
        }else if(instruction.variable.tipo_dec === 'NORMAL'){
        }else{
          console.log("Error: Intente declarar una variable simple");
        }
      }
      if(instruction.expresion instanceof Relacional){
        console.log(this.relational(instruction.expresion,instruction.fila,instruction.columna,blockArray));
      }else{
        console.log("Error: La estructura del for no es correcta");
      }
      if(instruction.asignacion instanceof OperacionSimplificada){
        let found = null;
        for (let i = 0; i < blockArray.length; i++) {
          if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.asignacion.valor,instruction.fila,instruction.columna) !== null){
            found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.asignacion.valor,instruction.fila,instruction.columna);
            break;
          }
        }
        //console.log(found);
        let counter = found.valor;
        let counterBlock = 0;
        while(true){
          if(counterBlock > 0){
            let newBlock = new BloqueRun('for',instruction.fila,instruction.columna,[],[],[]);
            this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
            if(instruction.variable instanceof Variable){
              if(instruction.variable.tipo_dec === 'ASIGNACION'){
                let found = null;
                for (let i = 0; i < blockArray.length; i++) {
                  if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction.variable.value.tipo_var[0].valor,blockRow,blockCol) !== null){
                    found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction.variable.value.tipo_var[0].valor,blockRow,blockCol);
                    break;
                  }
                }
                if(found === null){
                  if(instruction.variable.value.value instanceof Valor){
                    if(instruction.variable.value.value.tipo === instruction.variable.tipo_var){
                      let valueToAssign = null;
                      if(instruction.variable.tipo_var === 'int'){valueToAssign = parseInt(instruction.variable.value.value.valor);}
                      else if(instruction.variable.tipo_var === 'string' || instruction.variable.tipo_var === 'char'){valueToAssign = instruction.variable.value.value.valor.toString();}
                      else if(instruction.variable.tipo_var === 'boolean'){valueToAssign = (instruction.variable.value.value.valor === 'true');}
                      else if(instruction.variable.tipo_var === 'double'){valueToAssign = parseFloat(instruction.variable.value.value.valor);}
                      let newVariable = new VariableRun(instruction.variable.tipo_var, instruction.variable.value.tipo_var[0].valor, valueToAssign, 'variable');
                      this.addVariable(blockArray,instruction.fila,instruction.columna,newVariable);
                    } else{
                      console.log("Error: El valor asignado no corresponde con el tipo de variable");
                    }
                  }
                }else{
                  console.log("Error: La variable " + instruction.variable.value.tipo_var[0].valor + " ya ha sido declarada anteriormente");
                }
              }else if(instruction.variable.tipo_dec === 'NORMAL'){
              }else{
                console.log("Error: Intente declarar una variable simple");
              }
            }
          }
          let valor1 = new Valor(found.tipo,counter);
          let valor2 = new Valor(instruction.expresion.value2.tipo,instruction.expresion.value2.valor)
          let comparable = new Relacional(valor1,valor2,instruction.expresion.type);
          if(!this.relational(comparable,instruction.fila,instruction.columna,blockArray)){break;}
          if (found !== null) {
            if (found.tipo === "int" || found.tipo === "double") {
              if (instruction.asignacion.tipo === "++") {
                for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
                  this.runInstructions('for',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
                }
                counter = parseInt(counter) + 1;
                found.valor = counter;
              } else {
                for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
                  this.runInstructions('for',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
                }
                counter = parseInt(counter) - 1;
                found.valor = counter;
              }
            } else {
              console.log("Error: La variable a la que quiere cambiar su cantidad, no es numérica");
              break;
            }
          }else{
            console.log("Error: La variable a la que le quiere cambiar el valor, aún no está declarada");
            break;
          }
          for (let i = 0; i < blockArray.length; i++) {
            if(this.removeBlock(blockArray[i],instruction.fila,instruction.columna)){
              break;
            }
          }
          counterBlock = counterBlock + 1;
        }
        found.valor = counter;
    }
    } else if (instruction instanceof While) {
      console.log(instruction);
      let newBlock = new BloqueRun('while',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);

      let counterBlock = 0;
      while(true){
        let breaked = false;
        if(counterBlock > 0){
          let newBlock = new BloqueRun('while',instruction.fila,instruction.columna,[],[],[]);
          this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        }
        //let valor1 = new Valor(found.tipo,counter);
        //let valor2 = new Valor(instruction.expresion.value2.tipo,instruction.expresion.value2.valor)
        //let comparable = new Relacional(valor1,valor2,instruction.expresion.type);
        if(!this.relational(instruction.expresion,instruction.fila,instruction.columna,blockArray)){break;}
        for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
          let returned = this.runInstructions('while',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
          if(returned instanceof Break){
            breaked = true;
            break;
          }else if(returned instanceof Continue){
            break;
          }else{continue;}
        }
        for (let i = 0; i < blockArray.length; i++) {
          if(this.removeBlock(blockArray[i],instruction.fila,instruction.columna)){
            break;
          }
        }
        counterBlock = counterBlock + 1;
        if(breaked){break;}
      }
    } else if (instruction instanceof DoWhile) {
      console.log(instruction);
      let newBlock = new BloqueRun('dowhile',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
      for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
        let returned = this.runInstructions('dowhile',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
        if(returned instanceof Break){
          breaked = true;
          break;
        }else if(returned instanceof Continue){
          break;
        }else{continue;}
      }

      for (let i = 0; i < blockArray.length; i++) {
        if(this.removeBlock(blockArray[i],instruction.fila,instruction.columna)){
          break;
        }
      }
      while(true){
        let newBlock = new BloqueRun('dowhile',instruction.fila,instruction.columna,[],[],[]);
        this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        //let valor1 = new Valor(found.tipo,counter);
        //let valor2 = new Valor(instruction.expresion.value2.tipo,instruction.expresion.value2.valor)
        //let comparable = new Relacional(valor1,valor2,instruction.expresion.type);
        if(!this.relational(instruction.expresion,instruction.fila,instruction.columna,blockArray)){break;}
        for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
          this.runInstructions('dowhile',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
        }
        for (let i = 0; i < blockArray.length; i++) {
          if(this.removeBlock(blockArray[i],instruction.fila,instruction.columna)){
            break;
          }
        }
      }
    } else if (instruction instanceof Switch) {
      console.log(instruction);
      let newBlock = new BloqueRun('switch',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);

      let principal = this.returnValue(instruction.expresion,instruction.fila,instruction.columna,blockArray);
      let breaked = false;
      for (let i = 0; i < instruction.bloque.length; i++) {
        let returned = this.returnValue(instruction.bloque[i].expresion,instruction.fila,instruction.columna,blockArray);
        if(instruction.bloque[i].tipo === 'CASE'){
          if(returned !== null){
            console.log(principal === returned);
            if(principal === returned){
              for (let j = 0; j < instruction.bloque[i].bloque.Instrucciones.length; j++) {
                let newBlock2 = new BloqueRun('case',instruction.bloque[i].bloque.fila,instruction.bloque[i].bloque.columna,[],[],[]);
                this.addBlock(blockArray,instruction.fila,instruction.columna,newBlock2);
                let Insreturned = this.runInstructions('case',instruction.bloque[i].bloque.fila,instruction.bloque[i].bloque.columna,instruction.bloque[i].bloque.Instrucciones[j],blockArray);
                if(Insreturned instanceof Break){
                  breaked = true;
                  break;
                }else{continue;}
              }
            }else{continue;}
            if(breaked){break;}
          }else{console.log("Error: El valor a evaluar es nulo");}
        }else{
          for (let j = 0; j < instruction.bloque[i].bloque.Instrucciones.length; j++) {
            let newBlock2 = new BloqueRun('default',instruction.bloque[i].bloque.fila,instruction.bloque[i].bloque.columna,[],[],[]);
            this.addBlock(blockArray,instruction.fila,instruction.columna,newBlock2);
            let Insreturned = this.runInstructions('default',instruction.bloque[i].bloque.fila,instruction.bloque[i].bloque.columna,instruction.bloque[i].bloque.Instrucciones[j],blockArray);
            if(Insreturned instanceof Break){
              breaked = true;
              break;
            }
          }
          if(breaked){break;}
        }
      }
    } else if (instruction instanceof Break) {
      return instruction;
    } else if (instruction instanceof Return) {
    } else if (instruction instanceof Continue) {
      return instruction;
    } else if (instruction instanceof Imprimir) {
      if(instruction === 'print'){
        this.consoleText += this.printText(instruction.valor,blockRow,blockCol,blockArray); 
      }else{
        this.consoleText += this.printText(instruction.valor,blockRow,blockCol,blockArray) + "\n";
      }
    }
    return null;
  }

  foundFunction(idFunction,fila,columna,blocks) {
    //console.log(blocks.length);
    for (let i = 0; i < blocks.length; i++) {
      //console.log(idFunction + " =? " + blocks[i].nombre + " && " + fila + " =? " + blocks[i].fila + " && " + columna + " =? " + blocks[i].columna);
      if (idFunction === blocks[i].nombre && fila === blocks[i].fila && columna === blocks[i].columna) {
        //console.log("Entra pa");
        return blocks[i];
      }else{
        if(this.foundFunction(idFunction,fila,columna,blocks[i].bloques) !== null || blocks[i].bloques.length !== 0){
          return this.foundFunction(idFunction,fila,columna,blocks[i].bloques);
        }else{
          continue;
        }
      }
    }
    return null;
  } 

  foundVariable(block,tempVariables,idVariable,varRow,varCol){
    //console.log("id: " + block.nombre);
    //console.log(varRow + " =? " + block.fila + " && " + varCol + " =? " + block.columna)
    //console.log("tempvariables: ");
    //console.log(tempVariables);
    //console.log("---------------");
    //console.log(varRow === block.fila && varCol === block.columna);
    if(varRow === block.fila && varCol === block.columna){
      for (let i = 0; i < tempVariables.length; i++) {
        //console.log("Entra");
        //console.log("-> " + tempVariables[i].id + " =? " + idVariable);
        if(tempVariables[i].id === idVariable){
          //console.log("Entra 2");
          return tempVariables[i];
        }
      }
      //console.log("Llega aqui");
      return null;
    }else{
      for (let i = 0; i < block.bloques.length; i++) {
        let tempVariables2 = [];
        for (let k = 0; k < tempVariables.length; k++) {
          if(!this.alreadyVariable(tempVariables[k],tempVariables2)){
          tempVariables2.push(tempVariables[k]);
          }
        }
        for (let j = 0; j < block.variables.length; j++) {
          let newVariable = new VariableRun(block.variables[j].tipo,block.variables[j].id,block.variables[j].valor,'variable');
          if(!this.alreadyVariable(newVariable,tempVariables2)){
            tempVariables2.push(newVariable);
          }
        }
        for (let j = 0; j < block.bloques[i].variables.length; j++) {
          let newVariable = new VariableRun(block.bloques[i].variables[j].tipo,block.bloques[i].variables[j].id,block.bloques[i].variables[j].valor,'variable');
          if(!this.alreadyVariable(newVariable,tempVariables2)){
            tempVariables2.push(newVariable);
          }
        }
        //console.log("Bloque a enviar");
        //console.log(block.bloques[i]);
        if(this.foundVariable(block.bloques[i],tempVariables2,idVariable,varRow,varCol) !== null){
          return this.foundVariable(block.bloques[i],tempVariables2,idVariable,varRow,varCol);
        }else{
          continue;
        }
      }
      return null;
    }
  }

  removeBlock(block,varRow,varCol){
    if(varRow === block.fila && varCol === block.columna){
      return true;
    }else{
      for (let i = 0; i < block.bloques.length; i++) {
        if(this.removeBlock(block.bloques[i],varRow,varCol)){
          block.bloques.splice(i,1);
        }else{
          continue;
        }
      }
      return false;
    }
  }

  fillDefaultArray(type,size){
    let single = [];
    if(type === 'int'){
      for(let i = 0; i < size; i++){
        single[i] = 0;
      }
    } else if(type === 'double'){
      for(let i = 0; i < size; i++){
        single[i] = 0.0
      }
    } else if(type === 'boolean'){
      for(let i = 0; i < size; i++){
        single[i] = true;
      }
    } else if(type === 'string'){
      for(let i = 0; i < size; i++){
        single[i] = '';
      }
    }
    return single;
  }

  alreadyVariable(variable, array){
    for (let i = 0; i < array.length; i++) {
      if(variable.id === array[i].id){
        return true;
      }
    }
    return false;
  }

  addBlock(blocks,fatherRow,fatherCol,newBlock){
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].fila === fatherRow && blocks[i].columna === fatherCol) {
        blocks[i].bloques.push(newBlock);
      }else{
        this.addBlock(blocks[i].bloques,fatherRow,fatherCol,newBlock);
      }
    }
  } 

  addVariable(blocks,blockRow,blockCol,variable){
    for (let i = 0; i < blocks.length; i++) {
      if(blocks[i].fila === blockRow && blocks[i].columna === blockCol){
        if(this.foundVariable(blocks[i],blocks[i].variables,variable.id,blockRow,blockCol)){
          console.log("Error: La variable " + variable.id + " ya ha sido declarada");       
        }else{
          blocks[i].variables.push(variable);
          return true;
        }
      }else{
        this.addVariable(blocks[i].bloques,blockRow,blockCol,variable)
      }
    }
    return false;
  }

  typeValidation(value1, value2) {
    if (value1 === "int" && value2 === "int") {
      console.log("Declaracion correcta de integer");
      return true;
    } else if (value1 === "double" && value2 === "double") {
      console.log("Declaracion correcta de double");
      return true;
    } else if (value1 === "boolean" && value2 === "boolean") {
      console.log("Declaracion correcta de boolean");
      return true;
    } else if (value1 === "char" && value2 === "char") {
      console.log("Declaracion correcta de char");
      return true;
    } else if (value1 === "string" && value2 === "string") {
      console.log("Declaracion correcta de string");
      return true;
    } else {
      console.log(
        "Error: Declaracion incorrecta de variable con " +
          value1 +
          " y " +
          value2
      );
      return false;
    }
  }
  
  arithmetic(expression) {
    if (expression instanceof Operacion) {
      
      if (expression.signo === "+") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1) + parseInt(expression.value2.valor);
          }else{
            return this.arithmetic(expression.value1) + this.arithmetic(expression.value2);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) + this.arithmetic(expression.value2);
          }else{
            return this.arithmetic(expression.value1) + this.arithmetic(expression.value2);
          }
        }
        if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
            return parseInt(expression.value1.valor) + parseInt(expression.value2.valor);
        }
      } else if (expression.signo === "-") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1) - parseInt(expression.value2.valor);
          }else{
            return this.arithmetic(expression.value1) - this.arithmetic(expression.value2);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) - this.arithmetic(expression.value2);
          }else{
            return this.arithmetic(expression.value1) - this.arithmetic(expression.value2);
          }
        }
        if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
            return parseInt(expression.value1.valor) - parseInt(expression.value2.valor);
        }
      } else if (expression.signo === "/") {
      } else if (expression.signo === "*") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1) * parseInt(expression.value2.valor);
          }else{
            return this.arithmetic(expression.value1) * this.arithmetic(expression.value2);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) * this.arithmetic(expression.value2);
          }else{
            return this.arithmetic(expression.value1) * this.arithmetic(expression.value2);
          }
        }
        if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
            return parseInt(expression.value1.valor) * parseInt(expression.value2.valor);
        }
      } else if (expression.signo === "^") {
      } else if (expression.signo === "%") {
      }
    } else {
      //Negativo
      if(expression.value instanceof Valor){
        return ((parseInt(expression.value.valor))*(-1));
      }else{
        return ((this.arithmetic(expression.value))*(-1));
      }
    }
  }

  relational(expression,blockRow,blockCol,blockArray){
    if (expression instanceof Relacional){
      let value1 = this.relational(expression.value1,blockRow,blockCol,blockArray);
      let value2 = this.relational(expression.value2,blockRow,blockCol,blockArray);
      //console.log(value1);
      //console.log(value2);
      if(value1 === null || value2 === null){
        console.log("Error: En la comparación que intenta hacer, un valor es nulo");
        return null;
      } else if(expression.type == 'IGUAL_IGUAL'){
        if(this.relationalValidate(value1,value2,0)){
          if(value1 === value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } else if(expression.type === 'DIFERENTE_IGUAL'){
        if(this.relationalValidate(value1,value2,0)){
          if(value1 !== value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } else if(expression.type === 'MENOR'){
        if(this.relationalValidate(value1,value2,1)){
          if(value1 < value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } else if(expression.type === 'MENOR_IGUAL'){
        if(this.relationalValidate(value1,value2,1)){
          if(value1 <= value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } else if(expression.type === 'MAYOR'){
        if(this.relationalValidate(value1,value2,1)){
          if(value1 > value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } else{
        if(this.relationalValidate(value1,value2,1)){
          if(value1 >= value2){return true;}else{return false;}
        }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
      } 
    } else if (expression instanceof Valor){
      if(expression.tipo === 'int'){return parseInt(expression.valor);}
      else if(expression.tipo === 'string' || expression.tipo === 'char'){return expression.valor.toString();}
      else if(expression.tipo === 'boolean'){return (expression.valor === 'true');}
      else if(expression.tipo === 'double'){return parseFloat(expression.valor);}
    } else if (expression instanceof Id){
      for (let i = 0; i < blockArray.length; i++) {
        //console.log("-------> " +expression.valor);
        if(this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol) !== null){
          let founded = this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol);
          //console.log(founded);
          return founded.valor;     
        }else{
          continue;
        }
      }
      return null;
    }
  }

  relationalValidate(value1,value2,type){
    //console.log(typeof value1);
    //console.log(typeof value2);
    if(type===0){
      if(typeof value1 === 'boolean' && typeof value2 === 'boolean'){
        return true;
      } else if (typeof value1 === 'number' && typeof value2 === 'number'){
        return true;
      } else if (typeof value1 === 'string' && typeof value2 === 'string'){
        return true;
      } else{
        return false;
      }
    } else{
      if(typeof value1 === 'boolean' && typeof value2 === 'boolean'){
        return false;
      } else if (typeof value1 === 'number' && typeof value2 === 'number'){
        return true;
      } else if (typeof value1 === 'string' && typeof value2 === 'string'){
        return false;
      } else{
        return false;
      }
    }
  }

  returnValue(expression,blockRow,blockCol,blockArray){
    if(expression instanceof Valor){
      if(expression.tipo === 'int'){return parseInt(expression.valor);}
      else if(expression.tipo === 'string' || expression.tipo === 'char'){return expression.valor.toString();}
      else if(expression.tipo === 'boolean'){return (expression.valor === 'true');}
      else if(expression.tipo === 'double'){return parseFloat(expression.valor);}
      return null;
    }else if(expression instanceof Id){
      for (let i = 0; i < blockArray.length; i++) {
        if(this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol) !== null){
          let founded = this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol);
          return founded.valor;     
        }else{
          continue;
        }
      }
      return null;
    }
    return null;
  }

  printText(expression,blockRow,blockCol,blockArray){
    if (expression instanceof Operacion && expression){
      let value1 = this.printText(expression.value1,blockRow,blockCol,blockArray);
      let value2 = this.printText(expression.value2,blockRow,blockCol,blockArray);
      return value1 + value2;
    } else if (expression instanceof Valor){
      if(expression.tipo === 'int'){return parseInt(expression.valor);}
      else if(expression.tipo === 'string' || expression.tipo === 'char'){
        let splited = expression.valor.replace('\"','');
        let splited2 = splited.replace('\"','');
        let splited3 = splited2.replace('\'','');
        let splited4 = splited3.replace('\'','');
        return splited4;
      }else if(expression.tipo === 'boolean'){return (expression.valor === 'true');}
      else if(expression.tipo === 'double'){return parseFloat(expression.valor);}
    } else if (expression instanceof Id){
      for (let i = 0; i < blockArray.length; i++) {
        if(this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol) !== null){
          let founded = this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol);
          if(founded.tipo === 'string'){
            let splited = founded.valor.replace('\"','');
            let splited2 = splited.replace('\'','');
            return splited2;
          }
          return founded.valor;     
        }else{
          continue;
        }
      }
      return null;
    }
  }

  getConsoleText(){
    return this.consoleText;
  }
}