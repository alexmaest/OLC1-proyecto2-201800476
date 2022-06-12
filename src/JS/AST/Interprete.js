class Interprete {

  constructor() {
    this.bloques = [];
    this.consoleText = '';
    this.fails = [];
  }

  analize(node) {
    this.globalNode = node;
    this.bloques.push(new BloqueRun('global',-1,-1,[],[],[]));
    let blockFound = this.foundFunction('global',-1,-1,this.bloques);
    if (node === undefined || node === null) return;
    for (let i = 0; i < node.length; i++) {
      if (node[i] instanceof Funcion) {
        if (this.foundFunction(node[i].id,node[i].fila,node[i].columna,this.bloques) !== null) {
          this.fails.push(new semanticError("Error: Función " + node[i].id + " ya ha sido declarada",node[i].fila,node[i].columna));
        } else {
          let tempArguments = [];
          for(let l = 0; l < node[i].parametros.length; l++){
            tempArguments.push(new VariableRun(node[i].parametros[l].tipo_dec,node[i].parametros[l].id,null,node[i].parametros[l].tipo_var));
          }
          let newBlock = new BloqueRun(node[i].id,node[i].fila,node[i].columna,[],[],tempArguments);
          this.addBlock(this.bloques,-1,-1,newBlock);
        }
      }else{continue;}
    }
    for (let i = 0; i < node.length; i++) {
      if (node[i] instanceof Variables) {
        this.variableDeclaration(node[i],this.bloques,blockFound,-1,-1);
      } else if (node[i] instanceof Llamada) {
        if(node[i].tipo === 'RUN'){
          //let allBlocks = this.bloques[0].bloques;
          for (let j = 0; j < node.length; j++) {
            if (node[j] instanceof Funcion){
              if(node[i].id === node[j].id){
                let tempArguments = [];
                for(let l = 0; l < node[j].parametros.length; l++){
                  let result = this.returnValue(node[i].parametros[l],node[i].fila,node[i].columna,this.bloques,node[i].fila,node[i].columna);
                  tempArguments.push(new VariableRun(node[j].parametros[l].tipo_dec,node[j].parametros[l].id,result.tipo_dec,'variable'));
                }
                let returnedFunction = this.foundFunction(node[i].id,node[j].fila,node[j].columna,this.bloques);
                returnedFunction.variables = tempArguments;
                for (let k = 0; k < node[j].bloque.Instrucciones.length; k++) {
                  this.runInstructions(node[i].id,node[j].fila,node[j].columna,node[j].bloque.Instrucciones[k],this.bloques);
                }
              }
            }else{continue;}
          }
        }
      } else if (node[i] instanceof Imprimir) {
        if(node[i].tipo === 'print'){
          let result = this.returnValue(node[i],allBlocks[j].fila,allBlocks[j].columna,this.bloques,node[i].fila,node[i].columna);
          this.consoleText += result.tipo_dec; 
          //this.consoleText += this.printText(node[i].valor,-1,-1,this.bloques); 
        }else{
          let result = this.returnValue(node[i],allBlocks[j].fila,allBlocks[j].columna,this.bloques,node[i].fila,node[i].columna);
          this.consoleText += result.tipo_dec + "\n"; 
          //this.consoleText += this.printText(node[i].valor,-1,-1,this.bloques) + "\n";
        }
      } else{continue;}
    }
  }

  runInstructions(blockId,blockRow,blockCol,instruction,blockArray) {
    let blockFound = this.foundFunction(blockId,blockRow,blockCol,blockArray);
    if (instruction instanceof Variables) {
      this.variableDeclaration(instruction,blockArray,blockFound,blockRow,blockCol);
    } else if (instruction instanceof Asignacion) {
      let found = this.generalFoundVariable(blockArray,instruction.tipo_var,blockRow,blockCol);
      let valueFounded = this.returnValue(instruction.value,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
      if (found !== null) {
        if(instruction.tipo_asg === 'NORMAL' && found.tipoVar === 'variable'){
          if(valueFounded.value === found.tipo){
            found.valor = valueFounded.tipo_dec;
          } else{
            this.fails.push(new semanticError("El valor asignado no corresponde con el tipo de variable",instruction.fila,instruction.columna));
          }
        } else if(instruction.tipo_asg === 'SINGLE_ARRAY' && found.tipoVar === 'array'){
          if(valueFounded.value === found.tipo){
            let valueToAssign = valueFounded.tipo_dec;
            found.valor = valueToAssign;
          } else{
            this.fails.push(new semanticError("El valor asignado no corresponde con el tipo de variable",instruction.fila,instruction.columna));
          }
        } else if(instruction.tipo_asg === 'DOUBLE_ARRAY' && found.tipoVar === 'array_doble'){
          if(valueFounded.value === found.tipo){
            let valueToAssign = valueFounded.tipo_dec;
            found.valor = valueToAssign;
          } else if(instruction.value.lista[0] instanceof NuevoArray){
            let valueToAssign = valueFounded.tipo_dec;
            found.valor = valueToAssign;
          } else{
            this.fails.push(new semanticError("El valor asignado no corresponde con el tipo de variable",instruction.fila,instruction.columna));
          }
        } else if(instruction.value instanceof ModificacionArray){
          let returnedExp =  this.returnValue(instruction.value.exp,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
          let returnedAssign =  this.returnValue(instruction.value.valor,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
          for (let i = 0; i < found.valor.length; i++) {
            if(i === returnedExp.tipo_dec){
              found.valor[i] = returnedAssign.tipo_dec;
              break;
            }
          }
        } else if(instruction.value instanceof ModificacionArrayDoble){
          let returnedExp1 =  this.returnValue(instruction.value.exp1,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
          let returnedExp2 =  this.returnValue(instruction.value.exp2,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
          let returnedAssign =  this.returnValue(instruction.value.valor,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
          for (let i = 0; i < found.valor.length; i++) {
            for (let j = 0; j < found.valor[i].length; j++) {
              if(i === returnedExp1.tipo_dec && j === returnedExp2.tipo_dec){
                found.valor[i][j] = returnedAssign.tipo_dec;
                break;
              }
            }
          }
        } else{
          this.fails.push(new semanticError("Error: Quiere asignar un valor de una variable de diferentes dimensiones",instruction.fila,instruction.columna));
          //Falta otros tipos de asignacion
        }
      }else{this.fails.push(new semanticError("Error: La variable " + type.tipo_var + " aún no se ha declarado",instruction.fila,instruction.columna));}
    } else if (instruction instanceof OperacionSimplificada) {
      this.returnValue(instruction,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
    } else if (instruction instanceof Llamada) {
      if(instruction.tipo === 'NORMAL'){
        this.returnValue(instruction,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
      }else{
        //Funciones predeterminadas
      }
    } else if (instruction instanceof If) {
      let result = this.returnValue(instruction.condicion,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
      if(result.tipo_dec){
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
      let newBlock = new BloqueRun('for',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
      //Declaracion o asignacion
      this.runInstructions('for',instruction.fila,instruction.columna,instruction.variable,blockArray);

      //Valor de la variable a iterar
      let found = this.generalFoundVariable(blockArray,instruction.asignacion.valor,instruction.fila,instruction.columna);

      let setValue = found;
      let counterBlock = 0;
      while(true){
        //Reiniciar instrucciones
        if(counterBlock > 0){
          let newBlock = new BloqueRun('for',instruction.fila,instruction.columna,[],[],[]);
          let tempFound = this.generalFoundVariable(blockArray,instruction.asignacion.valor,instruction.fila,instruction.columna);
          if(tempFound !== null){tempFound.value = setValue.value;}
          else{newBlock.variables.push(setValue);}
          this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        }

        //Condición
        let valor1 = this.returnValue(instruction.expresion.value1,instruction.fila,instruction.columna,blockArray,instruction.fila,instruction.columna);
        let valor2 = this.returnValue(instruction.expresion.value2,instruction.fila,instruction.columna,blockArray,instruction.fila,instruction.columna);
        let comparable = new Relacional(valor1,valor2,instruction.expresion.type);
        if(!this.relational(comparable,instruction.fila,instruction.columna,blockArray,instruction.fila,instruction.columna)){break;}

        if (found !== null) {
          if (found.tipo === "int" || found.tipo === "double") {
            //Instrucciones
            for (let i = 0; i < instruction.bloque.Instrucciones.length; i++) {
              this.runInstructions('for',instruction.fila,instruction.columna,instruction.bloque.Instrucciones[i],blockArray);
            }
            //Actualización
            this.runInstructions('for',instruction.fila,instruction.columna,instruction.asignacion,blockArray);
            let found2 = this.generalFoundVariable(blockArray,instruction.asignacion.valor,instruction.fila,instruction.columna);
            setValue = found2;
          } else {
            this.fails.push(new semanticError("Error: La variable a la que quiere cambiar su cantidad, no es numérica",instruction.fila,instruction.columna));
            break;
          }
        }else{
          this.fails.push(new semanticError("Error: La variable a la que le quiere cambiar el valor, aún no está declarada",instruction.fila,instruction.columna));
          break;
        }
        for (let i = 0; i < blockArray.length; i++) {
          if(this.removeBlock(blockArray[i],instruction.fila,instruction.columna)){
            break;
          }
        }
        counterBlock = counterBlock + 1;
      }
      //found.valor = counter;
    } else if (instruction instanceof While) {
      let newBlock = new BloqueRun('while',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);

      let counterBlock = 0;
      while(true){
        let breaked = false;
        if(counterBlock > 0){
          let newBlock = new BloqueRun('while',instruction.fila,instruction.columna,[],[],[]);
          this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        }
        let result = this.returnValue(instruction.expresion,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
        if(result.tipo_dec === false){break;}
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
      let newBlock = new BloqueRun('dowhile',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
      let breaked = false;
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
        if(breaked){break;}
        let newBlock = new BloqueRun('dowhile',instruction.fila,instruction.columna,[],[],[]);
        this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);
        let result = this.returnValue(instruction.expresion,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
        if(result.tipo_dec === false){break;}
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
      }
    } else if (instruction instanceof Switch) {
      let newBlock = new BloqueRun('switch',instruction.fila,instruction.columna,[],[],[]);
      this.addBlock(blockArray,blockFound.fila,blockFound.columna,newBlock);

      let principal = this.returnValue(instruction.expresion,instruction.fila,instruction.columna,blockArray,instruction.fila,instruction.columna);
      let breaked = false;
      for (let i = 0; i < instruction.bloque.length; i++) {
        let returned = this.returnValue(instruction.bloque[i].expresion,instruction.fila,instruction.columna,blockArray,instruction.fila,instruction.columna);
        if(instruction.bloque[i].tipo === 'CASE'){
          if(returned !== null){
            if(principal.tipo_dec === returned.tipo_dec){
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
          }else{this.fails.push(new semanticError("Error: El valor a evaluar es nulo",instruction.fila,instruction.columna));}
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
      return instruction;
    } else if (instruction instanceof Continue) {
      return instruction;
    } else if (instruction instanceof Imprimir) {
      if(instruction.tipo === 'print'){
        let result = this.returnValue(instruction.valor,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
        this.consoleText += result.tipo_dec; 
      }else{
        let result = this.returnValue(instruction.valor,blockRow,blockCol,blockArray,instruction.fila,instruction.columna);
        this.consoleText += result.tipo_dec + "\n"; 
      }
    }
    return null;
  }

  foundFunction(idFunction,fila,columna,blocks) {
    for (let i = 0; i < blocks.length; i++) {
      if (idFunction === blocks[i].nombre && fila === blocks[i].fila && columna === blocks[i].columna) {
        return blocks[i];
      }else{
        if(this.foundFunction(idFunction,fila,columna,blocks[i].bloques) !== null){
          return this.foundFunction(idFunction,fila,columna,blocks[i].bloques);
        }else{
          continue;
        }
      }
    }
    return null;
  } 

  generalFoundVariable(blockArray,instruction,blockRow,blockCol){
    let found = null;
    for (let i = 0; i < blockArray.length; i++) {
      if(this.foundVariable(blockArray[i],blockArray[i].variables,instruction,blockRow,blockCol) !== null){
        found = this.foundVariable(blockArray[i],blockArray[i].variables,instruction,blockRow,blockCol);
        break;
      }
    }
    return found;
  }

  foundVariable(block,tempVariables,idVariable,varRow,varCol){
    //console.log("Entrada");
    //console.log(tempVariables);
    //console.log(idVariable);
    //console.log(varRow + " === " + block.fila + " && " + varCol + " === " + block.columna)
    if(varRow === block.fila && varCol === block.columna){
      //console.log(tempVariables.length);
      for (let i = 0; i < tempVariables.length; i++) {
        //console.log("---------")
        //console.log(tempVariables[i].id)
        //console.log("---------")
        //console.log(idVariable);
        //console.log("---------")
        if(tempVariables[i].id === idVariable){
          //console.log("retorna1");
          return tempVariables[i];
        }
      }
      //console.log("retorna2");
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
          if(!this.alreadyVariable(block.variables[j],tempVariables2)){
            tempVariables2.push(block.variables[j]);
          }
        }
        for (let j = 0; j < block.bloques[i].variables.length; j++) {
          if(!this.alreadyVariable(block.bloques[i].variables[j],tempVariables2)){
            tempVariables2.push(block.bloques[i].variables[j]);
          }
        }
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

  fillDefaultArray(type,size1,size2,arrayType){
    let single = [];
    if(arrayType === 'simple'){
      if(type === 'int'){
        for(let i = 0; i < size1; i++){
          single.push(0);
        }
      } else if(type === 'double'){
        for(let i = 0; i < size1; i++){
        }
      } else if(type === 'boolean'){
        for(let i = 0; i < size1; i++){
          single.push(true);
        }
      } else if(type === 'string'){
        for(let i = 0; i < size1; i++){
          single.push('');
        }
      } else if(type === 'char'){
        for(let i = 0; i < size1; i++){
          single.push('0');
        }
      }
    }else{
      if(type === 'int'){
        for(let i = 0; i < size1; i++){
          let single2 = [];
          for(let j = 0; j < size2; j++){
            single2.push(0);
          }
          single.push(single2);
        }
      } else if(type === 'double'){
        for(let i = 0; i < size1; i++){
          let single2 = [];
          for(let j = 0; j < size2; j++){
            single2.push(0.0);
          }
          single.push(single2);
        }
      } else if(type === 'boolean'){
        for(let i = 0; i < size1; i++){
          let single2 = [];
          for(let j = 0; j < size2; j++){
            single2.push(true);
          }
          single.push(single2);
        }
      } else if(type === 'string'){
        for(let i = 0; i < size1; i++){
          let single2 = [];
          for(let j = 0; j < size2; j++){
            single2.push('');
          }
          single.push(single2);
        }
      } else if(type === 'char'){
        for(let i = 0; i < size1; i++){
          let single2 = [];
          for(let j = 0; j < size2; j++){
            single2.push('0');
          }
          single.push(single2);
        }
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
          this.fails.push(new semanticError("Error: La variable " + variable.id + " ya ha sido declarada",blockRow,blockCol));       
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

  arithmeticReturn(valor1,valor2,signo,insRow,insCol){
    if (signo === "+") {
      if(valor1.value === 'int'){
        if(valor2.value === 'int'){
        return new Variable('int',parseInt(valor1.tipo_dec) + parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          let result1 = parseFloat(valor1.tipo_dec);
          let result2 = parseFloat(valor2.tipo_dec);
          return new Variable('double',result1 + result2);
        } else if(valor2.value === 'boolean'){
          return new Variable('int',parseInt(valor1.tipo_dec)+1);
        } else if(valor2.value === 'char'){
          return new Variable('int',parseInt(valor1.tipo_dec) + valor2.tipo_dec.charCodeAt(1));
        } else{
          //cadena
          return new Variable('string',valor1.tipo_dec.toString() + valor2.tipo_dec.toString());
        }
      } else if(valor1.value === 'double'){
        if(valor2.value === 'int'){
          let result = parseFloat(valor2.tipo_dec);
          return new Variable('double',valor1.tipo_dec + result);
        } else if(valor2.value === 'double'){
          let result1 = parseFloat(valor1.tipo_dec);
          let result2 = parseFloat(valor2.tipo_dec);
          return new Variable('double',result1+ result2);
        } else if(valor2.value === 'boolean'){
          return new Variable('double',parseInt(valor1.tipo_dec)+1.0);
        } else if(valor2.value === 'char'){
          let final2 = valor2.tipo_dec.charCodeAt(1);
          return new Variable('double',parseFloat(valor1.tipo_dec) + parseFloat(final2));
        } else{
          //cadena
          return new Variable('string',valor1.tipo_dec.toString() + valor2.tipo_dec.toString());
        }
      } else if(valor1.value === 'boolean'){
        if(valor2.value === 'int'){
        return new Variable('int',parseInt(valor2.tipo_dec)+1);
        } else if(valor2.value === 'double'){
          return new Variable('double',parseFloat(valor2.tipo_dec)+1.0);
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede concatenar valores booleanos",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          this.fails.push(new semanticError("Error: No puede concatenar valores booleanos con caracteres",insRow,insCol));
          return new Variable(null,null);
        } else{
          //cadena
          return new Variable('string',valor1.tipo_dec.toString() + valor2.tipo_dec.toString());
        }
      } else if(valor1.value === 'char'){
        if(valor2.value === 'int'){
          return new Variable('int',parseInt(valor1.tipo_dec.charCodeAt(1)) + parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.charCodeAt(1).toFixed(1) + parseFloat(valor2.tipo_dec));
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede concatenar valores booleanos con caracteres",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          return new Variable('string',valor1.tipo_dec.toString() + valor2.tipo_dec.toString());
        } else{
          //cadena
          let single = valor1.tipo_dec;
          if(valor1.value === "char"){
            single=valor1.tipo_dec.replace(/['"]+/g, '');
          }
          let single2 = valor2.tipo_dec;
          if(valor2.value === "char"){
            single2=valor2.tipo_dec.replace(/['"]+/g, '');
          }
          return new Variable('string',single1.toString() + single2.toString());
        }
      } else{
        //cadena
        let single = valor1.tipo_dec;
        if(valor1.value === "char"){
          single=valor1.tipo_dec.replace(/['"]+/g, '');
        }
        let single2 = valor2.tipo_dec;
        if(valor2.value === "char"){
          single2=valor2.tipo_dec.replace(/['"]+/g, '');
        }
        return new Variable('string',single.toString() + single2.toString());
      }
    }else if (signo === "-") {
      if(valor1.value === 'int'){
        if(valor2.value === 'int'){
        return new Variable('int',parseInt(valor1.tipo_dec) - parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.toFixed(1) - valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          return new Variable('int',parseInt(valor1.tipo_dec));
        } else if(valor2.value === 'char'){
          return new Variable('int',parseInt(valor1.tipo_dec) - valor2.tipo_dec.charCodeAt(1));
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede restar valores enteros con caracteres",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'double'){
        if(valor2.value === 'int'){
        return new Variable('double',valor1.tipo_dec - valor2.tipo_dec.toFixed(1));
        } else if(valor2.value === 'double'){
          let result1 = parseInt(valor1.tipo_dec);
          return new Variable('double',result1.toFixed(1) - valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          return new Variable('double',valor1.tipo_dec.toFixed(1));
        } else if(valor2.value === 'char'){
          return new Variable('double',valor1.tipo_dec.toFixed(1) - valor2.tipo_dec.charCodeAt(1).toFixed(1));
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede restar valores double con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'boolean'){
        if(valor2.value === 'int'){
        return new Variable('int',parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor2.tipo_dec.toFixed(1));
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede restar valores booleanos",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          this.fails.push(new semanticError("Error: No puede restar valores booleanos con caracteres",insRow,insCol));
          return new Variable(null,null);
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede concatenar valores booleanos con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'char'){
        if(valor2.value === 'int'){
          return new Variable('int',parseInt(valor1.tipo_dec.charCodeAt(1)) - parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.charCodeAt(1).toFixed(1) - valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede restar valores booleanos con caracteres",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          this.fails.push(new semanticError("Error: No puede restar caracteres",insRow,insCol));
          return new Variable(null,null);
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede restar valores caracteres con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else{
        //cadena
        this.fails.push(new semanticError("Error: No puede restar cadenas con ningun tipo de valor",insRow,insCol));
        return new Variable(null,null);
      }
    }else if (signo === "*") {
      if(valor1.value === 'int'){
        if(valor2.value === 'int'){
        return new Variable('int',parseInt(valor1.tipo_dec) * parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.toFixed(1) * valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede multiplicar valores enteros con booleanos",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          return new Variable('int',parseInt(valor1.tipo_dec) * valor2.tipo_dec.charCodeAt(1));
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede multiplicar valores enteros con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'double'){
        if(valor2.value === 'int'){
          let result1 = parseInt(valor1.tipo_dec);
          let result2 = parseInt(valor2.tipo_dec);
        return new Variable('double',valor1.tipo_dec * result2.toFixed(1));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec * valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede multiplicar valores double con booleanos",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          let final2 = valor2.tipo_dec.charCodeAt(1);
          return new Variable('double',valor1.tipo_dec * final2.toFixed(1));
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede multiplicar valores double con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'boolean'){
        this.fails.push(new semanticError("Error: No puede multiplicar ningun tipo de valor con un booleano",insRow,insCol));
        return new Variable(null,null);
      } else if(valor1.value === 'char'){
        if(valor2.value === 'int'){
          return new Variable('int',parseInt(valor1.tipo_dec.charCodeAt(1)) * parseInt(valor2.tipo_dec));
        } else if(valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.charCodeAt(1).toFixed(1) * valor2.tipo_dec);
        } else if(valor2.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede multiplicar caracteres con booleanos",insRow,insCol));
          return new Variable(null,null);
        } else if(valor2.value === 'char'){
          this.fails.push(new semanticError("Error: No puede multiplicar caracteres",insRow,insCol));
          return new Variable(null,null);
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede multiplicar caracteres con cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      } else{
        //cadena
        this.fails.push(new semanticError("Error: No puede multiplicar cadenas",insRow,insCol));
        return new Variable(null,null);
      }
    }else if (signo === "/"){
      if(valor2.value !== 0){
        if(valor1.value === 'int'){
          if(valor2.value === 'int'){
          return new Variable('int',parseInt(valor1.tipo_dec) / parseInt(valor2.tipo_dec));
          } else if(valor2.value === 'double'){
            let result1 = parseInt(valor1.tipo_dec);
            return new Variable('double',parseFloat(result1) / valor2.tipo_dec);
          } else if(valor2.value === 'boolean'){
            this.fails.push(new semanticError("Error: No puede dividir valores enteros con booleanos",insRow,insCol));
            return new Variable(null,null);
          } else if(valor2.value === 'char'){
            return new Variable('double',((valor1.tipo_dec) / valor2.tipo_dec.charCodeAt(1)).toFixed(1));
          } else{
            //cadena
            this.fails.push(new semanticError("Error: No puede dividir valores enteros con cadenas",insRow,insCol));
            return new Variable(null,null);
          }
        } else if(valor1.value === 'double'){
          if(valor2.value === 'int'){
          return new Variable('double',valor1.tipo_dec * parseFloat(valor2.tipo_dec));
          } else if(valor2.value === 'double'){
            return new Variable('double',parseFloat(valor1.tipo_dec) * parseFloat(valor2.tipo_dec));
          } else if(valor2.value === 'boolean'){
            this.fails.push(new semanticError("Error: No puede dividir valores double con booleanos",insRow,insCol));
            return new Variable(null,null);
          } else if(valor2.value === 'char'){
            return new Variable('double',parseFloat(valor1.tipo_dec) * valor2.tipo_dec.charCodeAt(1).toFixed(1));
          } else{
            //cadena
            this.fails.push(new semanticError("Error: No puede dividir valores double con cadenas",insRow,insCol));
            return new Variable(null,null);
          }
        } else if(valor1.value === 'boolean'){
          this.fails.push(new semanticError("Error: No puede dividir ningun tipo de valor con un booleano",insRow,insCol));
          return new Variable(null,null);
        } else if(valor1.value === 'char'){
          if(valor2.value === 'int'){
            return new Variable('double',(parseInt(valor1.tipo_dec.charCodeAt(1)) + parseInt(valor2.tipo_dec)).toFixed(1));
          } else if(valor2.value === 'double'){
            return new Variable('double',valor1.tipo_dec.charCodeAt(1).toFixed(1) + valor2.tipo_dec);
          } else if(valor2.value === 'boolean'){
            this.fails.push(new semanticError("Error: No puede dividir caracteres con booleanos",insRow,insCol));
            return new Variable(null,null);
          } else if(valor2.value === 'char'){
            this.fails.push(new semanticError("Error: No puede dividir caracteres",insRow,insCol));
            return new Variable(null,null);
          } else{
            //cadena
            this.fails.push(new semanticError("Error: No puede dividir caracteres con cadenas",insRow,insCol));
            return new Variable(null,null);
          }
        } else{
          //cadena
          this.fails.push(new semanticError("Error: No puede dividir cadenas",insRow,insCol));
          return new Variable(null,null);
        }
      }else{
        this.fails.push(new semanticError("Error: No puede dividir entre cero",insRow,insCol));
        return new Variable(null,null);
      }
    }else if (signo === "^"){
      if(valor1.value === 'int'){
        if(valor2.value === 'int'){
          let singleValue = parseInt(valor1.tipo_dec);
          for(let i = 0; i < parseInt(valor2.tipo_dec); i++){
            valor1.tipo_dec = valor1.tipo_dec * singleValue;
          }
          return new Variable('int',valor1.tipo_dec);
        } else if(valor2.value === 'double'){
          let singleValue = parseInt(valor1.tipo_dec);
          for(let i = 0; i < parseInt(valor2.tipo_dec); i++){
            valor1.tipo_dec = valor1.tipo_dec.toFixed(1) * singleValue.toFixed(1);
          }
          return new Variable('double',valor1.tipo_dec);
        } else{
          this.fails.push(new semanticError("Error: No puede hacer una potenciación si los valores no son numéricos",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'double'){
        if(valor2.value === 'int'){
          let singleValue = parseInt(valor1.tipo_dec);
          for(let i = 0; i < parseInt(valor2.tipo_dec); i++){
            valor1.tipo_dec = valor1.tipo_dec.toFixed(1) * singleValue.toFixed(1);
          }
          return new Variable('double',valor1.tipo_dec);
        } else if(valor2.value === 'double'){
          let singleValue = parseInt(valor1.tipo_dec);
          for(let i = 0; i < parseInt(valor2.tipo_dec); i++){
            valor1.tipo_dec = valor1.tipo_dec.toFixed(1) * singleValue.toFixed(1);
          }
          return new Variable('double',valor1.tipo_dec);
        } else{
          this.fails.push(new semanticError("Error: No puede hacer una potenciación si los valores no son numéricos",insRow,insCol));
          return new Variable(null,null);
        }
      } else{
        this.fails.push(new semanticError("Error: No puede hacer una potenciación si los valores no son numéricos",insRow,insCol));
        return new Variable(null,null);
      }
    }else{
      //Modulo
      if(valor1.value === 'int'){
        if(valor2.value === 'int' || valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.toFixed(1) % valor2.tipo_dec.toFixed(1));
        } else{
          this.fails.push(new semanticError("Error: No puede realizar un modulo si el valor no es numérico",insRow,insCol));
          return new Variable(null,null);
        }
      } else if(valor1.value === 'double'){
        if(valor2.value === 'int' || valor2.value === 'double'){
          return new Variable('double',valor1.tipo_dec.toFixed(1) % valor2.tipo_dec.toFixed(1));
        } else{
          this.fails.push(new semanticError("Error: No puede realizar un modulo si el valor no es numérico",insRow,insCol));
          return new Variable(null,null);
        }
      } else{
        this.fails.push(new semanticError("Error: No puede realizar un modulo si el valor no es numérico",insRow,insCol));
        return new Variable(null,null);
      }
    }
  }

  arithmeticValues(value1,value2,blockRow,blockCol,blockArray,signo,insRow,insCol){
    if(value1 instanceof Operacion || value1 instanceof Negativo){
      if(value2 instanceof Valor){
        let single = this.arithmetic(value1,blockRow,blockCol,blockArray,insRow,insCol);
        return this.arithmeticReturn(single,new Variable(value2.tipo,value2.valor),signo,insRow,insCol);
      }else if(value2 instanceof Id){
        let returned = this.returnValue(value2,blockRow,blockCol,blockArray,insRow,insCol);
        let single = this.arithmetic(value1,blockRow,blockCol,blockArray,insRow,insCol);
        return this.arithmeticReturn(single,returned,signo,insRow,insCol);
      }else{
        let single1 = this.arithmetic(value1,blockRow,blockCol,blockArray,insRow,insCol);
        let single2 = this.arithmetic(value2,blockRow,blockCol,blockArray,insRow,insCol)
        return this.arithmeticReturn(single1,single2,signo,insRow,insCol);
      }
    }
    return null;
  }

  arithmetic(expression,blockRow,blockCol,blockArray,insRow,insCol) {
    if (expression instanceof Operacion) {
      if(this.arithmeticValues(expression.value1,expression.value2,blockRow,blockCol,blockArray,expression.signo,insRow,insCol) !== null){
        return this.arithmeticValues(expression.value1,expression.value2,blockRow,blockCol,blockArray,expression.signo,insRow,insCol);
      } else if(this.arithmeticValues(expression.value2,expression.value1,blockRow,blockCol,blockArray,expression.signo,insRow,insCol) !== null){
        return this.arithmeticValues(expression.value2,expression.value1,blockRow,blockCol,blockArray,expression.signo,insRow,insCol);
      } else if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
        return this.arithmeticReturn(new Variable(expression.value1.tipo,expression.value1.valor),new Variable(expression.value2.tipo,expression.value2.valor),expression.signo,insRow,insCol);
      } else if(expression.value1 instanceof Id && expression.value2 instanceof Valor){
        return this.arithmeticReturn(this.returnValue(expression.value1,blockRow,blockCol,blockArray,insRow,insCol),new Variable(expression.value2.tipo,expression.value2.valor),expression.signo,insRow,insCol);
      } else if(expression.value1 instanceof Valor && expression.value2 instanceof Id){
        return this.arithmeticReturn(new Variable(expression.value1.tipo,expression.value1.valor),this.returnValue(expression.value2,blockRow,blockCol,blockArray,insRow,insCol),expression.signo,insRow,insCol);
      } else{
        //Ambos id
        let returned1 = this.returnValue(expression.value1,blockRow,blockCol,blockArray,insRow,insCol);
        let returned2 = this.returnValue(expression.value2,blockRow,blockCol,blockArray,insRow,insCol);
        return this.arithmeticReturn(returned1,returned2,expression.signo,insRow,insCol);
      }
    } else {
      //Negativo
      if(expression.value instanceof Operador){
        let result = this.returnValue(expression.value,blockRow,blockCol,blockArray,insRow,insCol);
        return (new Variable("boolean",result.tipo_dec));
      }
      if(expression.value instanceof Valor){
        if(expression.value.tipo === 'int'){
          return (new Variable(expression.value.tipo,(parseInt(expression.value.valor))*(-1)));
        }else{
          let result = ((expression.value.valor)*(-1));
          return (new Variable(expression.value.tipo,parseInt(result)));
        }
      }else{
        if(expression instanceof AccesoArraySimple){
          let returned1 = this.returnValue(expression,blockRow,blockCol,blockArray,insRow,insCol);
          return (new Variable("int",returned1.tipo_dec));
        }
        if(expression.value.tipo === 'int'){
          let result = ((this.arithmetic(expression.value,blockRow,blockCol,blockArray,insRow,insCol)));
          return (new Variable(expression.value.tipo,parseInt(result.tipo_dec)*(-1)));
        }else{
          let result = ((this.arithmetic(expression.value,blockRow,blockCol,blockArray,insRow,insCol)));
          let result2 = parseInt(result.tipo_dec);
          let result3 = result2.toFixed(1);
          return (new Variable(expression.value.tipo,result3*(-1)));
        }
      }
    }
  }

  relational(expression,blockRow,blockCol,blockArray,insRow,insCol){
    let value1 = expression.value1;
    let value2 = expression.value2;
    if(value1 === null || value2 === null){
      this.fails.push(new semanticError("Error: En la comparación que intenta hacer, un valor es nulo",blockRow,blockCol));
      return null;
    } else if(expression.type == 'IGUAL_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec === value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } else if(expression.type === 'DIFERENTE_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec !== value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } else if(expression.type === 'MENOR'){
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec < value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } else if(expression.type === 'MENOR_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec <= value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } else if(expression.type === 'MAYOR'){
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec > value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } else{
      if(this.relationalValidate(value1,value2)){
        if(value1.tipo_dec >= value2.tipo_dec){return true;}else{return false;}
      }else{this.fails.push(new semanticError('Error: Los tipos de validacion no coinciden',insRow,insCol));return null;}
    } 
  }

  relationalValidate(value1,value2){
    if(value1.value === value2.value){
      return true;
    } else{
      return false;
    }
  }

  returnValue(expression,blockRow,blockCol,blockArray,insRow,insCol){
    if(expression instanceof Valor){
      if(expression.tipo === 'int'){return new Variable('int',parseInt(expression.valor),'variable');}
      else if(expression.tipo === 'string'){return new Variable('string',expression.valor.toString(),'varible');}
      else if(expression.tipo === 'boolean'){return new Variable('boolean',(expression.valor === 'true'),'variable');}
      else if(expression.tipo === 'double'){return new Variable('double',parseFloat(expression.valor),'variable');}
      else{return new Variable('char',expression.valor.toString(),'varible');}
    }else if(expression instanceof Id){
      for (let i = 0; i < blockArray.length; i++) {
        if(this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol) !== null){
          let founded = this.foundVariable(blockArray[i],blockArray[i].variables,expression.valor,blockRow,blockCol);
          return new Variable(founded.tipo,founded.valor,founded.tipoVar);
        }else{
          continue;
        }
      }
      return null;
    }else if(expression instanceof Operacion) {
      let result = this.arithmetic(expression,blockRow,blockCol,blockArray,insRow,insCol);
      return new Variable(result.value,result.tipo_dec,'variable');
    }else if(expression instanceof AccesoArraySimple){
      let found = this.generalFoundVariable(blockArray,expression.id,blockRow,blockCol);
      if(found === null){return null;}
      let returned = this.returnValue(expression.expresion,blockRow,blockCol,blockArray,insRow,insCol);
      if(returned.value === 'int'){
        if(found.tipoVar === 'array'){
          for (let i = 0; i < found.valor.length; i++) {
            if(returned.tipo_dec === i){
              return new Variable(found.tipo,found.valor[i],found.tipoVar);     
            }else{continue;}
          }
        }else{this.fails.push(new semanticError("Error: Intenta llamar a una variable de diferentes dimensiones a las declaradas",insRow,insCol));return null;}
      }else{this.fails.push(new semanticError("Error: Intenta llamar a una lista con una posición de tipo " + returned.value,insRow,insCol));return null;}
    }else if(expression instanceof AccesoArrayDoble){
      let found = this.generalFoundVariable(blockArray,expression.id,blockRow,blockCol);
      if(found === null){return null;}
      let returned1 = this.returnValue(expression.expresion1,blockRow,blockCol,blockArray,insRow,insCol);
      let returned2 = this.returnValue(expression.expresion2,blockRow,blockCol,blockArray,insRow,insCol);
      if(returned1.value === 'int' && returned2.value === 'int'){
        if(found.tipoVar === 'array_doble'){
          for (let i = 0; i < found.valor.length; i++) {
            for (let j = 0; j < found.valor[i].length; j++) {
              if(returned1.tipo_dec === i && returned2.tipo_dec === j){
                return new Variable(found.tipo,found.valor[i][j],found.tipoVar);     
              }else{continue;}
            }
          }
        }else{this.fails.push(new semanticError("Error: Intenta llamar a una variable de diferentes dimensiones a las declaradas",insRow,insCol));return null;}
      }else{this.fails.push(new semanticError("Error: Intenta llamar a una lista con una posición de tipo diferente a la que intenta declarar",insRow,insCol));return null;}
    }else if(expression instanceof Llamada){
      if(expression.tipo === "NORMAL"){
        let allBlocks = this.bloques[0].bloques;
        for (let i = 0; i < allBlocks.length; i++) {
          if(expression.id === allBlocks[i].nombre){
            if(allBlocks[i].parametros.length === expression.parametros.length){
              let tempArguments = [];
              for(let l = 0; l < allBlocks[i].parametros.length; l++){
                let callParamether = this.returnValue(expression.parametros[l],blockRow,blockCol,allBlocks,insRow,insCol);
                if(allBlocks[i].parametros[l].tipo === callParamether.value){
                  if(allBlocks[i].parametros[l].tipoVar === callParamether.var_tipo){
                    tempArguments.push(new VariableRun(allBlocks[i].parametros[l].tipo,allBlocks[i].parametros[l].id,callParamether.tipo_dec,allBlocks[i].parametros[l].tipoVar));
                  }else{this.fails.push(new semanticError("Error: Las dimensiones de un parámetro dado no son correctas",insRow,insCol));}
                }else{this.fails.push(new semanticError("Error: El tipo de valor de un parametro no coincide con los valores dados",insRow,insCol));}
              }
              let foundedFunction = this.foundFunction(allBlocks[i].nombre,allBlocks[i].fila,allBlocks[i].columna,allBlocks);
              foundedFunction.variables = tempArguments;
              for (let j = 0; j < this.globalNode.length; j++) {
                if(this.globalNode[j] instanceof Funcion){
                  if(this.globalNode[j].id === allBlocks[i].nombre){
                    for (let l = 0; l < this.globalNode[j].bloque.Instrucciones.length; l++) {
                      let returnedIns = this.runInstructions(this.globalNode[j].id,this.globalNode[j].fila,this.globalNode[j].columna,this.globalNode[j].bloque.Instrucciones[l],this.bloques);
                      if(returnedIns instanceof Return){
                        let valueReturned = this.returnValue(returnedIns.expresion,this.globalNode[j].fila,this.globalNode[j].columna,allBlocks,insRow,insCol);
                        if(valueReturned.value === this.globalNode[j].tipo_var){return valueReturned;}
                        //else if(returnedIns.expresion === null && this.bloques[i].tipo_var === 'void'){return null;}
                        else{return null;}
                        //break;
                      }else{continue;}
                    }
                  }
                }else{continue;}
              }
            }else{this.fails.push(new semanticError("Error: La función que intenta llamar no coincide con el número de parámetros ingresados",insRow,insCol));}
            break;
          }else{continue;}
        }
      }else{
        //console.log(expression);
        let returned = this.returnValue(expression.parametros,blockRow,blockCol,blockArray,insRow,insCol);
        if(returned !== null){
          if(expression.tipo === "TOLOWER"){
              let temp = returned.tipo_dec.toString();
              return Variable("string",temp.toLowerCase(),'variable');
          }else if(expression.tipo === "TOUPPER"){
            let temp = returned.tipo_dec.toString();
            return Variable("string",temp.toUpperCase(),'variable');
          }else if(expression.tipo === "ROUND"){
            if(returned.value === "int" || returned.value === "double"){
              let temp = returned.tipo_dec.toString();
              return Variable("int",Math.round(temp),'variable');
            }else{
              this.fails.push(new semanticError("Error: El valor sobre el que quiere usar la función round() no es numérico",insRow,insCol));
              return null;
            }
          }else if(expression.tipo === "LENGTH"){
            let returned2 = this.returnValue(expression.parametros.id,blockRow,blockCol,blockArray,insRow,insCol);
            if(expression.parametros instanceof AccesoArraySimple){
              if(returned2.var_tipo === "array" || returned2.var_tipo === "array_doble"){
                return new Variable("int",returned2.tipo_dec.length,'variable');
              }else{
                this.fails.push(new semanticError("Error: El valor sobre el que quiere usar la función length() no es un vector, lista o cadena",insRow,insCol));
                return null;
              }
            }else if(returned.value === "string" || returned.value === "char" || returned.value === "int"){
              return new Variable("int",returned.tipo_dec.length,'variable');
            }else{
              this.fails.push(new semanticError("Error: El valor sobre el que quiere usar la función length() no es válido",insRow,insCol));
              return null;
            }
          }else if(expression.tipo === "TYPEOF"){
            if(returned.var_tipo === "array"){
              return Variable("string","vector",'variable');
            }else{
              return Variable("string",returned.value.toString(),'variable');
            }
          }else if(expression.tipo === "TOSTRING"){
            return Variable("string",returned.tipo_dec.toString(),'variable');
          }else{
            //TOCHARARRAY
            if(returned.value === "string"){
              return Variable("char",returned.value.split(''),'array');
            }else{
              this.fails.push(new semanticError("Error: El valor sobre el que quiere usar la función tochararray() no es válido",insRow,insCol));
              return null;
            }
          }
        }else{
          this.fails.push(new semanticError("Error: El valor sobre el que desea usar la función pre-definida no se pudo asignar",insRow,insCol));
          return null;
        }
      }
    }else if(expression instanceof OperacionSimplificada){
      let found = this.generalFoundVariable(blockArray,expression.valor,blockRow,blockCol);
      if (found !== null) {
        if (found.tipo === "int" || found.tipo === "double") {
          if (expression.tipo === "++") {
            found.valor = found.valor + 1;
          } else {
            found.valor = found.valor - 1;
          }
          return new Variable(found.tipo,found.valor,found.tipoVar);    
        } else{this.fails.push(new semanticError("Error: La variable a la que quiere cambiar su cantidad, no es numérica",insRow,insCol));}
      }else{this.fails.push(new semanticError("Error: La variable a la que le quiere cambiar el valor, aún no está declarada",insRow,insCol));}
    }else if(expression instanceof Casteo){
      let found2 = this.returnValue(expression.valor,blockRow,blockCol,blockArray,insRow,insCol);
      if(found2 !== null){
        //int a string
        if(expression.tipo === 'string' && found2.value === 'int'){
          //console.log("Valor casteado de int a string");
          return new Variable(expression.tipo,found2.tipo_dec.toString(),'variable');
        //int a double
        } else if(expression.tipo === 'double' && found2.value === 'int'){
          //console.log("Valor casteado de int a double");
          return new Variable(expression.tipo,(found2.tipo_dec).toFixed(1),'variable');
        //double a int
        } else if(expression.tipo === 'int' && found2.value === 'double'){
          //console.log("Valor casteado de double a int");
          return new Variable(expression.tipo,parseInt(found2.tipo_dec, 10),'variable');
        //double a string
        } else if(expression.tipo === 'string' && found2.value === 'double'){
          //console.log("Valor casteado de double a string");
          return new Variable(expression.tipo,found2.tipo_dec.toString(),'variable');
        //int a char
        } else if(expression.tipo === 'char' && found2.value === 'int'){
          //console.log("Valor casteado de int a char");
          return new Variable(expression.tipo,String.fromCharCode(found2.tipo_dec),'variable');
        //char a int
        } else if(expression.tipo === 'int' && found2.value === 'char'){
          //console.log("Valor casteado de char a int");
          return new Variable(expression.tipo,(found2.tipo_dec.charCodeAt(1)),'variable');
        //char a double
        } else if(expression.tipo === 'double' && found2.value === 'char'){
          //console.log("Valor casteado de char a double");
          return new Variable(expression.tipo,found2.tipo_dec.charCodeAt(1).toFixed(1),'variable');
        }else{this.fails.push(new semanticError("Error: El tipo de casteo que desea realizar es incorrecto",insRow,insCol));}
      } else{this.fails.push(new semanticError("Error: El valor " + expression.valor + " no pudo ser casteado",insRow,insCol));return null;}
    }else if(expression instanceof Operador) {
      let single1 = this.returnValue(expression.value1,blockRow,blockCol,blockArray,insRow,insCol);
      let single2 = this.returnValue(expression.value2,blockRow,blockCol,blockArray,insRow,insCol);
      if(expression.tipo === "&&"){
        if(single1.tipo_dec === true && single2.tipo_dec === true){
          return new Variable("boolean",true,'variable');
        }else{
          return new Variable("boolean",false,'variable');
        }
      }else{
        if(single1.tipo_dec === true || single2.tipo_dec === true){
          return new Variable("boolean",true,'variable');
        }else{
          return new Variable("boolean",false,'variable');
        }
      }
    }else if(expression instanceof Negacion) {
      let single = this.returnValue(expression.value,blockRow,blockCol,blockArray,insRow,insCol);
      if(single.tipo_dec === true){
        return new Variable("boolean",false,'variable');
      }else{
        return new Variable("boolean",true,'variable');
      }
    }else if(expression instanceof Negativo) {
      let result = this.arithmetic(expression,blockRow,blockCol,blockArray,insRow,insCol);
      return new Variable('int',result.tipo_dec,'variable');
    }else if(expression instanceof nuevoArraySimple){
      let returned = this.returnValue(expression.expresion,blockRow,blockCol,blockArray,insRow,insCol);
      return new Variable(expression.tipo,this.fillDefaultArray(expression.tipo,returned.tipo_dec,null,'simple'),'array');
    }else if(expression instanceof nuevoArrayDoble){
      let returned1 = this.returnValue(expression.expresion1,blockRow,blockCol,blockArray,insRow,insCol);
      let returned2 = this.returnValue(expression.expresion2,blockRow,blockCol,blockArray,insRow,insCol);
      return new Variable(expression.tipo,this.fillDefaultArray(expression.tipo,returned1.tipo_dec,returned2.tipo_dec,'doble'),'array_doble');
    }else if(expression instanceof NuevoArray){
      let valores = [];
      let typeValue = "";
      if(expression.lista.length !== 0){
        typeValue = expression.lista[0].tipo;
      }
      for (let i = 0; i < expression.lista.length; i++) {
        if(typeValue !== expression.lista[i].tipo){this.fails.push(new semanticError("Error: Ha asignado valores de diferente tipo a una lista",insRow,insCol));return null;}
        let returned = this.returnValue(expression.lista[i],blockRow,blockCol,blockArray,insRow,insCol);
        valores.push(returned.tipo_dec);
      }
      return new Variable(typeValue,valores,'array');
    }else if(expression instanceof Relacional){
      let value1 = this.returnValue(expression.value1,blockRow,blockCol,blockArray,insRow,insCol);
      let value2 = this.returnValue(expression.value2,blockRow,blockCol,blockArray,insRow,insCol);

      return new Variable('boolean',this.relational(new Relacional(value1,value2,expression.type),blockRow,blockCol,blockArray,insRow,insCol),'variable');
    }else if(expression instanceof Ternario){
      let result = this.returnValue(expression.condicion,blockRow,blockCol,blockArray,insRow,insCol);
      if(result.tipo_dec){
        return this.returnValue(expression.exp1,blockRow,blockCol,blockArray,insRow,insCol);
      }else{
        return this.returnValue(expression.exp2,blockRow,blockCol,blockArray,insRow,insCol);
      }
    }else{
      return null;
    }
  }

  printText(expression,blockRow,blockCol,blockArray){
    if (expression instanceof Operacion){
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

  getErrores(){
    return this.fails;
  }

  variableDeclaration(instruction,blockArray,blockFound,blockRow,blockCol){
    for (let i = 0; i < instruction.arreglo.length; i++) {
      if (instruction.arreglo[i].tipo_dec === "NORMAL") {
        let found = this.generalFoundVariable(blockArray,instruction.arreglo[i].value.tipo_var,blockRow,blockCol);
        if (found === null) {
          let newVariable = null;
          if(instruction.tipo === 'int'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, 0, 'variable');}
          else if(instruction.tipo === 'string'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, "", 'variable');}
          else if(instruction.tipo === 'boolean'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, true, 'variable');}
          else if(instruction.tipo === 'double'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, 0.0, 'variable');}
          else{newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, '0', 'variable');}
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        }else{
          this.fails.push(new semanticError("Error: La variable " + instruction.arreglo[i].value + " ya ha sido declarada anteriormente",instruction.fila,instruction.columna));
        }
      } else if (instruction.arreglo[i].tipo_dec === "SINGLE_ARRAY") {
        this.fails.push(new semanticError("Error: Debe de inicializar el vector creado",instruction.fila,instruction.columna));
      } else if (instruction.arreglo[i].tipo_dec === "DOUBLE_ARRAY") {
        this.fails.push(new semanticError("Error: Debe de inicializar el vector doble creado",instruction.fila,instruction.columna));
      } else {
        let found = this.generalFoundVariable(blockArray,instruction.arreglo[i].value.tipo_var,blockRow,blockCol);
        if(found === null) {
          if(instruction.arreglo[i].value instanceof OperacionSimplificada) {
            if(found !== null){
              if(found.valor !== null){
                if(found.tipo === "int" || found.tipo === "double") {
                  if(instruction.arreglo[i].value.tipo === "++") {found.valor = found.valor + 1;}
                  else{found.valor = found.valor - 1;}
                } else{this.fails.push(new semanticError("Error: No puede aumentar cantidad en una variable no numérica",instruction.fila,instruction.columna));}
              } else{this.fails.push(new semanticError("Error: La variable a la que le quiere cambiar su valor es nula, debe inicializarla",instruction.fila,instruction.columna));}
            } else{this.fails.push(new semanticError("Error: La variable a la que le quiere cambiar su valor no existe",instruction.fila,instruction.columna));}
          } else{
            //Asignacion
            if (instruction.arreglo[i].value.tipo_asg === "NORMAL") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,1,blockRow,blockCol,instruction.fila,instruction.columna);
            } else if (instruction.arreglo[i].value.tipo_asg === "SINGLE_ARRAY") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,2,blockRow,blockCol);
            } else if (instruction.arreglo[i].value.tipo_asg === "DOUBLE_ARRAY") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,3,blockRow,blockCol);
            }
          }
        }else{this.fails.push(new semanticError("Error: La variable " + instruction.arreglo[i].value.tipo_var + " ya ha sido declarada anteriormente",instruction.fila,instruction.columna));}
      }
    }
  }

  asignationValue(type,instruction,blockArray,blockFound,typeVar,blockRow,blockCol,insRow,insCol){
    if (instruction.value.value instanceof Operacion) {
      if(typeVar === 1){
        let result = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(result !== null){
          //if(type === result.value){
            let newVariable = new VariableRun(type, instruction.value.tipo_var,result.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          //} else{
           // this.fails.push(new semanticError("Error: Está intentando asignar contenidos de tipo incorrectos en variables",insRow,insCol));
          //}
        }else{
          this.fails.push(new semanticError("Error: No se ha podido realizar la operación",insRow,insCol));
        }
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Negativo) {
      if(typeVar === 1){
        if(type === 'int' || type === 'double'){
          let result = this.arithmetic(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
          let newVariable = new VariableRun(type, instruction.value.tipo_var,result.tipo_dec,'variable');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          this.fails.push(new semanticError("Error: Solo puede asignar valores numéricos a variables numéricas",insRow,insCol));
        }
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Valor){
      if(typeVar === 1){
        if(instruction.value.value.tipo === type){
          let valueToAssign = null;
          if(type === 'int'){valueToAssign = parseInt(instruction.value.value.valor);}
          else if(type === 'string' || type === 'char'){valueToAssign = instruction.value.value.valor.toString();}
          else if(type === 'boolean'){valueToAssign = (instruction.value.value.valor === 'true');}
          else if(type === 'double'){valueToAssign = parseFloat(instruction.value.value.valor);}
          let newVariable = new VariableRun(type, instruction.value.tipo_var, valueToAssign, 'variable');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          this.fails.push(new semanticError("Error: El valor asignado no corresponde con el tipo de variable",insRow,insCol));
        }
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof OperacionSimplificada){
      if(typeVar === 1){
        let found2 = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(found2 !== null){
          if (type === "int" || type === "double") {
            let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          } else {this.fails.push(new semanticError("Error: La variable en la que desea aumentar el valor no es numérica",insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.valor + " no existe",insRow,insCol));}
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Casteo){
      if(typeVar === 1){
        console.log(instruction.value.value.valor);
        let found2 = this.returnValue(instruction.value.value.valor,blockRow,blockCol,blockArray,insRow,insCol)
        if(found2 !== null){
          if (type === instruction.value.value.tipo) {
            //int a string
            if(instruction.value.value.tipo === 'string' && found2.value === 'int'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.tipo_dec.toString(),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de int a string");
            //int a double
            } else if(instruction.value.value.tipo === 'double' && found2.value === 'int'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,(found2.tipo_dec).toFixed(1),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de int a double");
            //double a int
            } else if(instruction.value.value.tipo === 'int' && found2.value === 'double'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,parseInt(found2.tipo_dec, 10),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de double a int");
            //double a string
            } else if(instruction.value.value.tipo === 'string' && found2.value === 'double'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,found2.tipo_dec.toString(),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de double a string");
            //int a char
            } else if(instruction.value.value.tipo === 'char' && found2.value === 'int'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,String.fromCharCode(found2.tipo_dec),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de int a char");
            //char a int
            } else if(instruction.value.value.tipo === 'int' && found2.value === 'char'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,(found2.tipo_dec.charCodeAt(1)),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de char a int");
            //char a double
            } else if(instruction.value.value.tipo === 'double' && found2.value === 'char'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,found2.tipo_dec.charCodeAt(1).toFixed(1),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              //console.log("Valor casteado de char a double");
            }else{this.fails.push(new semanticError("Error: El tipo de casteo que desea realizar es incorrecto",insRow,insCol));}
          }else{this.fails.push(new semanticError("Error: Quiere asignar un casteo de una variable tipo " + instruction.value.value.tipo + " en una tipo " + type,insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El valor " + instruction.value.value.valor.valor + " no pudo ser casteado",insRow,insCol));}
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof nuevoArraySimple){
      if(typeVar === 1){
      this.fails.push(new semanticError("Error: No puede asignar un vector simple a una variable normal",insRow,insCol));
      } else if(typeVar === 2){
        if(type === instruction.value.value.tipo){
          let returned = this.returnValue(instruction.value.value.expresion,blockRow,blockCol,blockArray,insRow,insCol);
          let newVariable = new VariableRun(type, instruction.value.tipo_var,this.fillDefaultArray(type,returned.tipo_dec,null,'simple'),'array');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          this.fails.push(new semanticError("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + type,insRow,insCol));
        }
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un vector simple a un vector doble",insRow,insCol));
      }
    } else if(instruction.value.value instanceof nuevoArrayDoble){
      if(typeVar === 1){
        this.fails.push(new semanticError("Error: No puede asignar un vector doble a una variable normal",insRow,insCol));
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un vector doble a un vector simple",insRow,insCol));
      } else{
        if(type === instruction.value.value.tipo){
          let returned1 = this.returnValue(instruction.value.value.expresion1,blockRow,blockCol,blockArray,insRow,insCol);
          let returned2 = this.returnValue(instruction.value.value.expresion2,blockRow,blockCol,blockArray,insRow,insCol);
          let newVariable = new VariableRun(type, instruction.value.tipo_var, this.fillDefaultArray(type,returned1.tipo_dec,returned2.tipo_dec,'doble'),'array_doble');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          this.fails.push(new semanticError("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + type,insRow,insCol));
        }
      }
    } else if(instruction.value.value instanceof NuevoArray){
      if(typeVar === 1){
        this.fails.push(new semanticError("Error: No puede asignar una lista a una variable normal",insRow,insCol));
      } else if(typeVar === 2){
        let valores = [];
        for (let i = 0; i < instruction.value.value.lista.length; i++) {
          let returned = this.returnValue(instruction.value.value.lista[i],blockRow,blockCol,blockArray,insRow,insCol);
          if(type === returned.value){
            valores.push(returned.tipo_dec);
          } else{
            this.fails.push(new semanticError("Error: Está asignando un valor tipo " + returned.value + " a una lista tipo " + type,insRow,insCol));
          }
        }
        let newVariable = new VariableRun(type, instruction.value.tipo_var,valores,'array');
        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
      } else{
        if(instruction.value.value.lista[0] instanceof NuevoArray){
          let valores = [];
          let longitud = instruction.value.value.lista[0].lista.length;
          for (let i = 0; i < instruction.value.value.lista.length; i++) {
            if(instruction.value.value.lista[i] instanceof NuevoArray){
              let returned = this.returnValue(instruction.value.value.lista[i],blockRow,blockCol,blockArray,insRow,insCol);
              if(type === returned.value){
                if(returned.tipo_dec.length === longitud){
                  valores.push(returned.tipo_dec);
                }else{this.fails.push(new semanticError("Error: Todas las listas que desea asignar al vector doble deben de ser equivalentes",insRow,insCol));}
              }else{this.fails.push(new semanticError("Error: Está asignando un valor tipo " + returned.value + " a una lista tipo " + type,insRow,insCol));}
            }else{this.fails.push(new semanticError("Error: La asignación que trata de hacer al vector doble no es correcta",insRow,insCol));}
          }
          let newVariable = new VariableRun(type, instruction.value.tipo_var,valores,'array_doble');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        }else{this.fails.push(new semanticError("Error: No puede asignar una lista a un vector doble",insRow,insCol));}
      }
    } else if(instruction.value.value instanceof AccesoArraySimple){
      if(typeVar === 1){
        let founded = this.generalFoundVariable(blockArray,instruction.value.value.id,blockRow,blockCol);
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(founded !== null){
          if(found.value === type){
            let newVariable = new VariableRun(type,instruction.value.tipo_var,found.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          }else{
            this.fails.push(new semanticError("Error: Quiere asignar una variable tipo " + found.value + " en una tipo " + type,insRow,insCol));
          }
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.id + " no existe",insRow,insCol));}
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector doble",insRow,insCol));
      }
    } else if(instruction.value.value instanceof AccesoArrayDoble){
      if(typeVar === 1){
        let founded = this.generalFoundVariable(blockArray,instruction.value.value.id,blockRow,blockCol);
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(founded !== null){
          if(found !== null){
            if(found.value === type){
              let newVariable = new VariableRun(type,instruction.value.tipo_var,found.tipo_dec,'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{
              this.fails.push(new semanticError("Error: Quiere asignar una variable tipo " + found.value + " en una tipo " + type,insRow,insCol));
            }
          }else{this.fails.push(new semanticError("Error: No se ha encontrado el valor para " + instruction.value.value.id,insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.id + " no existe",insRow,insCol));}
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector doble",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Operador){
      if(typeVar === 1){
        this.fails.push(new semanticError("Error: No puede asignar un operador a una variable",insRow,insCol));
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un operador a un vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un operador a un vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Negacion){
      if(typeVar === 1){
        this.fails.push(new semanticError("Error: No puede asignar un operador a una variable",insRow,insCol));
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar un operador a una vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar un operador a una vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Relacional){
      if(typeVar === 1){
        let result = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(result !== null){
          //if(type === result.value){
            let newVariable = new VariableRun(type, instruction.value.tipo_var,result.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          //} else{
           // this.fails.push(new semanticError("Error: Está intentando asignar contenidos de tipo incorrectos en variables",insRow,insCol));
          //}
        }else{
          this.fails.push(new semanticError("Error: No se ha podido realizar la operación",insRow,insCol));
        }
      } else if(typeVar === 2){
        this.fails.push(new semanticError("Error: No puede asignar una relación a una vector",insRow,insCol));
      } else{
        this.fails.push(new semanticError("Error: No puede asignar una relación a una vector",insRow,insCol));
      }
    } else if(instruction.value.value instanceof Id){
      let found2 = this.generalFoundVariable(blockArray,instruction.value.value.valor,blockRow,blockCol);
      if(typeVar === 1){
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'variable'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{this.fails.push(new semanticError("Error: Quiere asignar una variable de diferentes dimensiones en una simple",insRow,insCol));}
          }else{this.fails.push(new semanticError("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type,insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.valor + " no existe",insRow,insCol));}
      } else if(typeVar === 2){
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'array'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'array');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{this.fails.push(new semanticError("Error: Quiere asignar una variable de diferentes dimensiones en un vector",insRow,insCol));}
          }else{this.fails.push(new semanticError("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type,insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.valor + " no existe",insRow,insCol));}
      } else{
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'array_doble'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'array_doble');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
           }else{this.fails.push(new semanticError("Error: Quiere asignar una variable de diferentes dimensiones en un vector doble",insRow,insCol));}
          }else{this.fails.push(new semanticError("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type,insRow,insCol));}
        }else{this.fails.push(new semanticError("Error: El id " + instruction.value.value.valor + " no existe",insRow,insCol));}
      }
    } else if(instruction.value.value instanceof Llamada) {
      if(instruction.value.value.tipo === 'NORMAL'){
        let functionValue = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(typeVar === 1){
          if(functionValue.value === type){
            let valueToAssign = null;
            if(type === 'int'){valueToAssign = parseInt(functionValue.tipo_dec);}
            else if(type === 'string' || type === 'char'){valueToAssign = functionValue.tipo_dec.toString();}
            else if(type === 'boolean'){valueToAssign = (functionValue.tipo_dec === 'true');}
            else if(type === 'double'){valueToAssign = parseFloat(functionValue.tipo_dec);}
            let newVariable = new VariableRun(type, instruction.value.tipo_var, valueToAssign, 'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          } else{
            this.fails.push(new semanticError("El valor retornado no corresponde con el tipo de variable",insRow,insCol));
          }
        } else if(typeVar === 2){
          this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
        } else{
          this.fails.push(new semanticError("Error: No puede asignar un solo valor a un vector",insRow,insCol));
        }
      }else{
        //Funciones predeterminadas
      }
    } else if(instruction.value.value instanceof Ternario) {
      if(typeVar === 1){
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(found !== null){
          if(found.value === type){
            if(found.var_tipo === 'variable'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found.tipo_dec, 'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{this.fails.push(new semanticError("Error: El valor que trata asignar no corresponde con las dimensiones de la variable",insRow,insCol));}
          } else{this.fails.push(new semanticError("Error: El valor asignado no corresponde con el tipo de variable",insRow,insCol));}
        } else{this.fails.push(new semanticError("Error: No se pudo asignar el operador ternario a la variable",insRow,insCol));}
      } else if(typeVar === 2){
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(found !== null){
          if(found.value === type){
            if(found.var_tipo === 'array'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found.tipo_dec, 'array');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{this.fails.push(new semanticError("Error: El valor que trata asignar no corresponde con las dimensiones de la variable",insRow,insCol));}
          } else{this.fails.push(new semanticError("Error: El valor asignado no corresponde con el tipo de variable",insRow,insCol));}
        } else{this.fails.push(new semanticError("Error: No se pudo asignar el operador ternario a la variable",insRow,insCol));}
      } else{
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray,insRow,insCol);
        if(found !== null){
          if(found.value === type){
            if(found.var_tipo === 'array_doble'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found.tipo_dec, 'array_doble');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{this.fails.push(new semanticError("Error: El valor que trata asignar no corresponde con las dimensiones de la variable",insRow,insCol));}
          } else{this.fails.push(new semanticError("Error: El valor asignado no corresponde con el tipo de variable",insRow,insCol));}
        } else{this.fails.push(new semanticError("Error: No se pudo asignar el operador ternario a la variable",insRow,insCol));}
      }
    } else {
      return null;
    }
  }
}