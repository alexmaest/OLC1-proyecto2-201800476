class Interprete {

  constructor() {
    this.bloques = [];
    this.consoleText = '';
  }

  analize(node) {
    this.globalNode = node;
    this.bloques.push(new BloqueRun('global',-1,-1,[],[],[]));
    let blockFound = this.foundFunction('global',-1,-1,this.bloques);
    if (node === undefined || node === null) return;
    for (let i = 0; i < node.length; i++) {
      if (node[i] instanceof Funcion) {
        if (this.foundFunction(node[i].id,node[i].fila,node[i].columna,this.bloques) !== null) {
          console.log("Error: Función " + node[i].id + " ya ha sido declarada");
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
          let allBlocks = this.bloques[0].bloques;
          for (let j = 0; j < allBlocks.length; j++) {
            if(node[i].id === allBlocks[j].nombre){
              this.returnValue(node[i],allBlocks[j].fila,allBlocks[j].columna,this.bloques);
              break;
            }else{continue;}
          }
        }
      } else if (node[i] instanceof Imprimir) {
        if(node[i].tipo === 'print'){
          this.consoleText += this.printText(node[i].valor,-1,-1,this.bloques); 
        }else{
          this.consoleText += this.printText(node[i].valor,-1,-1,this.bloques) + "\n";
        }
      } else{continue;}
    }
  }

  runInstructions(blockId,blockRow,blockCol,instruction,blockArray) {
    let blockFound = this.foundFunction(blockId,blockRow,blockCol,blockArray);
    if (instruction instanceof Variables) {
      this.variableDeclaration(instruction,blockArray,blockFound,blockRow,blockCol);
    } else if (instruction instanceof Asignacion) {
      let found = this.generalFoundVariable(blockArray,type[0].valor,blockRow,blockCol);
      let valueFounded = this.returnValue(instruction.value,blockRow,blockCol,blockArray);
      if (found !== null) {
        if(instruction.tipo_asg === 'NORMAL' && found.tipoVar === 'variable'){
          if(valueFounded.tipo_var === found.tipo){
            let valueToAssign = valueFounded.value;
            if(found.tipo === 'int'){valueToAssign = parseInt(valueFounded.value);}
            else if(found.tipo === 'string' || found.tipo === 'char'){valueToAssign = valueFounded.value.toString();}
            else if(found.tipo === 'boolean'){valueToAssign = (valueFounded.value === 'true');}
            else if(found.tipo === 'double'){valueToAssign = parseFloat(valueFounded.value);}
            found.valor = valueToAssign;
          } else{
            console.log("El valor asignado no corresponde con el tipo de variable");
          }
        } else if(instruction.tipo_asg === 'SINGLE_ARRAY' && found.tipoVar === 'array'){
          if(valueFounded.tipo_var === found.tipo){
            found.valor = valueToAssign;
          } else{
            console.log("El valor asignado no corresponde con el tipo de variable");
          }
        } else if(instruction.tipo_asg === 'DOUBLE_ARRAY' && found.tipoVar === 'array_doble'){
          if(valueFounded.tipo_var === found.tipo){
            found.valor = valueToAssign;
          } else{
            console.log("El valor asignado no corresponde con el tipo de variable");
          }
        } else{
          console.log("Error: Quiere asignar un valor de una variable de diferentes dimensiones");
          //Falta otros tipos de asignacion
        }
      }else{console.log("Error: La variable " + type[0].valor + " aún no se ha declarado");}
    } else if (instruction instanceof OperacionSimplificada) {
      this.returnValue(instruction,blockRow,blockCol,blockArray);
    } else if (instruction instanceof Llamada) {
      if(instruction.tipo === 'NORMAL'){
        this.returnValue(instruction,blockRow,blockCol,blockArray);
      }else{
        //Funciones predeterminadas
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
        let valor1 = this.returnValue(instruction.expresion.value1,instruction.fila,instruction.columna,blockArray);
        let valor2 = this.returnValue(instruction.expresion.value2,instruction.fila,instruction.columna,blockArray);
        let comparable = new Relacional(valor1,valor2,instruction.expresion.type);
        if(!this.relational(comparable,instruction.fila,instruction.columna,blockArray)){break;}

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
      //found.valor = counter;
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
            console.log(principal.value === returned.value);
            if(principal.value === returned.value){
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
      return instruction;
    } else if (instruction instanceof Continue) {
      return instruction;
    } else if (instruction instanceof Imprimir) {
      if(instruction.tipo === 'print'){
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
          //let newVariable = new VariableRun(block.variables[j].tipo,block.variables[j].id,block.variables[j].valor,block.bloques[i].variables[j].tipoVar);
          if(!this.alreadyVariable(block.variables[j],tempVariables2)){
            tempVariables2.push(block.variables[j]);
          }
        }
        for (let j = 0; j < block.bloques[i].variables.length; j++) {
          //let newVariable = new VariableRun(block.bloques[i].variables[j].tipo,block.bloques[i].variables[j].id,block.bloques[i].variables[j].valor,block.bloques[i].variables[j].tipoVar);
          if(!this.alreadyVariable(block.bloques[i].variables[j],tempVariables2)){
            tempVariables2.push(block.bloques[i].variables[j]);
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
    //console.log(single);
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
  
  arithmetic(expression,blockRow,blockCol,blockArray) {
    if (expression instanceof Operacion) {
      
      if (expression.signo === "+") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) + parseInt(expression.value2.valor);
          }else if(expression.value2 instanceof Id){
            let returned = this.returnValue(expression.value2,blockRow,blockCol,blockArray);
            if(returned.tipo_var === 'int' || returned.tipo_var === 'double'){
              return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) + returned.value;
            }else{console.log("Error: El valor a operar no es numérico");return null;}
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) + this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) + this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }else if(expression.value1 instanceof Id){
            let returned = this.returnValue(expression.value1,blockRow,blockCol,blockArray);
            if(returned.tipo_var === 'int' || returned.tipo_var === 'double'){
              return returned.value + this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
            }else{console.log("Error: El valor a operar no es numérico");return null;}
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) + this.arithmetic(expression.value2,blockRow,blockCol,blockArray,blockRow,blockCol,blockArray);
          }
        }
        if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
            return parseInt(expression.value1.valor) + parseInt(expression.value2.valor);
        }
        if(expression.value1 instanceof Id && expression.value2 instanceof Id){
          let returned1 = this.returnValue(expression.value1,blockRow,blockCol,blockArray);
          let returned2 = this.returnValue(expression.value2,blockRow,blockCol,blockArray);
          if(returned1.tipo_var === 'int' || returned1.tipo_var === 'double' && returned2.tipo_var === 'int' || returned2.tipo_var === 'double'){
            return parseInt(returned1.value) + parseInt(returned2.value);
          }else{console.log("Error: El valor a operar no es numérico");return null;}
      }
      } else if (expression.signo === "-") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) - parseInt(expression.value2.valor);
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) - this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) - this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) - this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }
        }
        if(expression.value1 instanceof Valor && expression.value2 instanceof Valor){
            return parseInt(expression.value1.valor) - parseInt(expression.value2.valor);
        }
      } else if (expression.signo === "/") {
      } else if (expression.signo === "*") {
        if(expression.value1 instanceof Operacion || expression.value1 instanceof Negativo){
          if(expression.value2 instanceof Valor){
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) * parseInt(expression.value2.valor);
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) * this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }
        }
        if(expression.value2 instanceof Operacion || expression.value2 instanceof Negativo){
          if(expression.value1 instanceof Valor){
            return parseInt(expression.value1.valor) * this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
          }else{
            return this.arithmetic(expression.value1,blockRow,blockCol,blockArray) * this.arithmetic(expression.value2,blockRow,blockCol,blockArray);
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
        return ((this.arithmetic(expression.value,blockRow,blockCol,blockArray))*(-1));
      }
    }
  }

  relational(expression,blockRow,blockCol,blockArray){
    let value1 = expression.value1;
    let value2 = expression.value2;
    
    if(value1 === null || value2 === null){
      console.log("Error: En la comparación que intenta hacer, un valor es nulo");
      return null;
    } else if(expression.type == 'IGUAL_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.value === value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } else if(expression.type === 'DIFERENTE_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.value !== value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } else if(expression.type === 'MENOR'){
      if(this.relationalValidate(value1,value2)){
        if(value1.value < value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } else if(expression.type === 'MENOR_IGUAL'){
      if(this.relationalValidate(value1,value2)){
        if(value1.value <= value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } else if(expression.type === 'MAYOR'){
      if(this.relationalValidate(value1,value2)){
        if(value1.value > value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } else{
      if(this.relationalValidate(value1,value2)){
        if(value1.value >= value2.value){return true;}else{return false;}
      }else{console.log('Error: Los tipos de validacion no coinciden');return null;}
    } 
  }

  relationalValidate(value1,value2){
    //console.log(typeof value1);
    //console.log(typeof value2);
    if(value1.tipo_var === value2.tipo_var){
      return true;
    } else{
      return false;
    }
  }

  returnValue(expression,blockRow,blockCol,blockArray){
    if(expression instanceof Valor){
      if(expression.tipo === 'int'){return new Variable('int',parseInt(expression.valor),'varible');}
      else if(expression.tipo === 'string' || expression.tipo === 'char'){return new Variable('string',expression.valor.toString(),'varible');}
      else if(expression.tipo === 'boolean'){return new Variable('boolean',(expression.valor === 'true'),'varible');}
      else if(expression.tipo === 'double'){return new Variable('double',parseFloat(expression.valor),'varible');}
      return null;
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
      return new Variable('int',this.arithmetic(expression,blockRow,blockCol,blockArray),'variable');
    }else if(expression instanceof AccesoArraySimple){
      let found = this.generalFoundVariable(blockArray,expression.id,blockRow,blockCol);
      if(found === null){return null;}
      let returned = this.returnValue(expression.expresion,blockRow,blockCol,blockArray);
      if(returned.value === 'int'){
        if(found.tipoVar === 'array'){
          for (let i = 0; i < found.valor.length; i++) {
            if(returned.tipo_dec === i){
              return new Variable(found.tipo,found.valor[i],found.tipoVar);     
            }else{continue;}
          }
        }else{console.log("Error: Intenta llamar a una variable de diferentes dimensiones a las declaradas");return null;}
      }else{console.log("Error: Intenta llamar a una lista con una posición de tipo " + returned.value);return null;}
    }else if(expression instanceof AccesoArrayDoble){
      let found = this.generalFoundVariable(blockArray,expression.id,blockRow,blockCol);
      if(found === null){return null;}
      let returned1 = this.returnValue(expression.expresion1,blockRow,blockCol,blockArray);
      let returned2 = this.returnValue(expression.expresion2,blockRow,blockCol,blockArray);
      if(returned1.value === 'int' && returned2.value === 'int'){
        if(found.tipoVar === 'array_doble'){
          for (let i = 0; i < found.valor.length; i++) {
            for (let j = 0; j < found.valor[i].length; j++) {
              if(returned1.tipo_dec === i && returned2.tipo_dec === j){
                return new Variable(found.tipo,found.valor[i][j],found.tipoVar);     
              }else{continue;}
            }
          }
        }else{console.log("Error: Intenta llamar a una variable de diferentes dimensiones a las declaradas");return null;}
      }else{console.log("Error: Intenta llamar a una lista con una posición de tipo diferente a la que intenta declarar");return null;}
    }else if(expression instanceof Llamada){
      let allBlocks = blockArray[0].bloques;
      for (let i = 0; i < allBlocks.length; i++) {
        if(expression.id === allBlocks[i].nombre){
          if(allBlocks[i].parametros.length === expression.parametros.length){
            let tempArguments = [];
            for(let l = 0; l < allBlocks[i].parametros.length; l++){
              let callParamether = this.returnValue(expression.parametros[l],blockRow,blockCol,allBlocks);
              console.log(allBlocks[i].parametros[l].tipoVar);
              console.log(callParamether);
              if(allBlocks[i].parametros[l].tipo === callParamether.value){
                if(allBlocks[i].parametros[l].tipoVar === callParamether.var_tipo){
                  tempArguments.push(new VariableRun(allBlocks[i].parametros[l].tipo,allBlocks[i].parametros[l].id,callParamether.tipo_dec,allBlocks[i].parametros[l].tipoVar));
                }else{console.log("Error: Las dimensiones de un parámetro dado no son correctas");}
              }else{console.log("Error: El tipo de valor de un parametro no coincide con los valores dados");}
            }
            let foundedFunction = this.foundFunction(allBlocks[i].nombre,allBlocks[i].fila,allBlocks[i].columna,allBlocks);
            foundedFunction.variables = tempArguments;
            for (let j = 0; j < this.globalNode.length; j++) {
              if(this.globalNode[j] instanceof Funcion){
                if(this.globalNode[j].id === allBlocks[i].nombre){
                  for (let l = 0; l < this.globalNode[j].bloque.Instrucciones.length; l++) {
                    let returnedIns = this.runInstructions(this.globalNode[j].id,this.globalNode[j].fila,this.globalNode[j].columna,this.globalNode[j].bloque.Instrucciones[l],this.bloques);
                    if(returnedIns instanceof Return){
                      let valueReturned = this.returnValue(returnedIns.expresion,this.globalNode[j].fila,this.globalNode[j].columna,allBlocks);
                      console.log(this.globalNode[j]);
                      if(valueReturned.value === this.globalNode[j].tipo_var){return valueReturned;}
                      //else if(returnedIns.expresion === null && this.bloques[i].tipo_var === 'void'){return null;}
                      else{return null;}
                      //break;
                    }else{continue;}
                  }
                }
              }else{continue;}
            }
          }else{console.log("Error: La función que intenta llamar no coincide con el número de parámetros ingresados");}
          break;
        }else{continue;}
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
        } else{console.log("Error: La variable a la que quiere cambiar su cantidad, no es numérica");}
      }else{console.log("Error: La variable a la que le quiere cambiar el valor, aún no está declarada");}
    }
    return null;
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
          //console.log(blockArray);
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

  variableDeclaration(instruction,blockArray,blockFound,blockRow,blockCol){
    for (let i = 0; i < instruction.arreglo.length; i++) {
      if (instruction.arreglo[i].tipo_dec === "NORMAL") {
        let found = this.generalFoundVariable(blockArray,instruction.arreglo[i].value,blockRow,blockCol);
        if (found === null) {
          let newVariable = null;
          if(instruction.tipo === 'int'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, 0, 'variable');}
          else if(instruction.tipo === 'string'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, "", 'variable');}
          else if(instruction.tipo === 'boolean'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, true, 'variable');}
          else if(instruction.tipo === 'double'){newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, 0.0, 'variable');}
          else{newVariable = new VariableRun(instruction.tipo, instruction.arreglo[i].value, '0', 'variable');}
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        }else{
          console.log("Error: La variable " + instruction.arreglo[i].value + " ya ha sido declarada anteriormente");
        }
      } else if (instruction.arreglo[i].tipo_dec === "SINGLE_ARRAY") {
        console.log("Error: Debe de inicializar el vector creado");
      } else if (instruction.arreglo[i].tipo_dec === "DOUBLE_ARRAY") {
        console.log("Error: Debe de inicializar el vector doble creado");
      } else {
        let found = this.generalFoundVariable(blockArray,instruction.arreglo[i].value,blockRow,blockCol);
        if(found === null) {
          if(instruction.arreglo[i].value instanceof OperacionSimplificada) {
            if(found !== null){
              if(found.valor !== null){
                if(found.tipo === "int" || found.tipo === "double") {
                  if(instruction.arreglo[i].value.tipo === "++") {found.valor = found.valor + 1;}
                  else{found.valor = found.valor - 1;}
                } else{console.log("Error en aumentar cantidad en una variable no numérica");}
              } else{console.log("Error: La variable a la que le quiere cambiar su valor es nula, debe inicializarla");}
            } else{console.log("Error: La variable a la que le quiere cambiar su valor no existe");}
          } else{
            //Asignacion
            if (instruction.arreglo[i].value.tipo_asg === "NORMAL") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,1,blockRow,blockCol);
            } else if (instruction.arreglo[i].value.tipo_asg === "SINGLE_ARRAY") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,2,blockRow,blockCol);
            } else if (instruction.arreglo[i].value.tipo_asg === "DOUBLE_ARRAY") {
              this.asignationValue(instruction.tipo,instruction.arreglo[i],blockArray,blockFound,3,blockRow,blockCol);
            }
          }
        }else{console.log("Error: La variable " + instruction.arreglo[i].value + " ya ha sido declarada anteriormente");}
      }
    }
  }

  asignationValue(type,instruction,blockArray,blockFound,typeVar,blockRow,blockCol){
    if (instruction.value.value instanceof Operacion) {
      if(typeVar === 1){
        if(type === 'int' || type === 'double'){
          let newVariable = new VariableRun(type, instruction.value.tipo_var, this.arithmetic(instruction.value.value,blockRow,blockCol,blockArray),'variable');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        }else if(type === 'string'){
          let newVariable = new VariableRun(type, instruction.value.tipo_var, this.printText(instruction.value.value),'variable');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          console.log("Error: Está intentando asignar contenidos de tipo incorrectos en variables");
        }
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector");
      }
    } else if(instruction.value.value instanceof Negativo) {
      if(typeVar === 1){
        if(type === 'int' || type === 'double'){
          let newVariable = new VariableRun(type, instruction.value.tipo_var, this.arithmetic(instruction.value.value,blockRow,blockCol,blockArray),'variable');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          console.log("Error: Solo puede asignar valores numéricos a variables numéricas");
        }
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector");
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
          //console.log(blockFound);
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          console.log("El valor asignado no corresponde con el tipo de variable");
        }
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector");
      }
    } else if(instruction.value.value instanceof OperacionSimplificada){
      if(typeVar === 1){
        let found2 = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray);
        if(found2 !== null){
          if (type === "int" || type === "double") {
            let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          } else {console.log("Error: La variable en la que desea aumentar el valor no es numérica");}
        }else{console.log("Error: El id " + instruction.value.value.valor + " no existe");}
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector");
      }
    } else if(instruction.value.value instanceof Casteo){
      if(typeVar === 1){
        let found2 = this.generalFoundVariable(blockArray,instruction.value.value.valor.valor,blockRow,blockCol);
        if(found2 !== null){
          if (type === instruction.value.value.tipo) {
            //int a string
            if(instruction.value.value.tipo === 'string' && found2.tipo === 'int'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor.toString(),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              console.log("Variable casteada de int a string");
            //int a double
            } else if(instruction.value.value.tipo === 'double' && found2.tipo === 'int'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,(found2.valor).toFixed(1),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              console.log("Variable casteada de int a double");
            //double a int
            } else if(instruction.value.value.tipo === 'int' && found2.tipo === 'double'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var,parseInt(found2.valor, 10),'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
              console.log("Variable casteada de double a int");
            //double a string
          } else if(instruction.value.value.tipo === 'string' && found2.tipo === 'double'){
            let newVariable = new VariableRun(type, instruction.value.tipo_var,found2.valor.toString(),'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            console.log("Variable casteada de double a string");
          }
          } else{console.log("Error: Quiere asignar un casteo de una variable tipo " + instruction.value.value.tipo + " en una tipo " + type);}
        } else{console.log("Error: El id " + instruction.value.value.valor.valor + " no existe");}
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector");
      }
    } else if(instruction.value.value instanceof nuevoArraySimple){
      if(typeVar === 1){
      console.log("Error: No puede asignar un vector simple a una variable normal");
      } else if(typeVar === 2){
        if(type === instruction.value.value.tipo){
          let returned = this.returnValue(instruction.value.value.expresion,blockRow,blockCol,blockArray);
          let newVariable = new VariableRun(type, instruction.value.tipo_var,this.fillDefaultArray(type,returned.tipo_dec,null,'simple'),'array');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          console.log("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + type);
        }
      } else{
        console.log("Error: No puede asignar un vector simple a un vector doble");
      }
    } else if(instruction.value.value instanceof nuevoArrayDoble){
      if(typeVar === 1){
        console.log("Error: No puede asignar un vector doble a una variable normal");
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un vector doble a un vector simple");
      } else{
        if(type === instruction.value.value.tipo){
          let returned1 = this.returnValue(instruction.value.value.expresion1,blockRow,blockCol,blockArray);
          let returned2 = this.returnValue(instruction.value.value.expresion2,blockRow,blockCol,blockArray);
          let newVariable = new VariableRun(type, instruction.value.tipo_var, this.fillDefaultArray(type,returned1.tipo_dec,returned2.tipo_dec,'doble'),'array_doble');
          this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
        } else{
          console.log("Error: Está asignando un vector " + instruction.value.value.tipo + " a uno " + type);
        }
      }
    } else if(instruction.value.value instanceof NuevoArray){
      if(typeVar === 1){
        console.log("Error: No puede asignar una lista a una variable normal");
      } else if(typeVar === 2){
        let valores = [];
        for (let i = 0; i < instruction.value.value.lista.length; i++) {
          let returned = this.returnValue(instruction.value.value.lista[i],blockRow,blockCol,blockArray);
          if(type === returned.value){
            valores.push(returned.tipo_dec);
          } else{
            console.log("Error: Está asignando un valor tipo " + returned.value + " a una lista tipo " + type);
          }
        }
        let newVariable = new VariableRun(type, instruction.value.tipo_var,valores,'array');
        this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
      } else{
        console.log("Error: No puede asignar una lista a un vector doble");
      }
    } else if(instruction.value.value instanceof AccesoArraySimple){
      if(typeVar === 1){
        let founded = this.generalFoundVariable(blockArray,instruction.value.value.id,blockRow,blockCol);
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray);
        if(founded !== null){
          if(found.value === type){
            let newVariable = new VariableRun(type,instruction.value.tipo_var,found.tipo_dec,'variable');
            this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
          }else{
            console.log("Error: Quiere asignar una variable tipo " + found.value + " en una tipo " + type);
          }
        }else{console.log("Error: El id " + instruction.value.value.id + " no existe");}
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector doble");
      }
    } else if(instruction.value.value instanceof AccesoArrayDoble){
      if(typeVar === 1){
        let founded = this.generalFoundVariable(blockArray,instruction.value.value.id,blockRow,blockCol);
        let found = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray);
        if(founded !== null){
          if(found !== null){
            if(found.value === type){
              let newVariable = new VariableRun(type,instruction.value.tipo_var,found.tipo_dec,'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{
              console.log("Error: Quiere asignar una variable tipo " + found.value + " en una tipo " + type);
            }
          }else{console.log("Error: No se ha encontrado el valor para " + instruction.value.value.id);}
        }else{console.log("Error: El id " + instruction.value.value.id + " no existe");}
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un solo valor a un vector");
      } else{
        console.log("Error: No puede asignar un solo valor a un vector doble");
      }
    } else if(instruction.value.value instanceof Operador){
      if(typeVar === 1){
        console.log("Error: No puede asignar un operador a una variable");
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un operador a un vector");
      } else{
        console.log("Error: No puede asignar un operador a un vector");
      }
    } else if(instruction.value.value instanceof Negacion){
      if(typeVar === 1){
        console.log("Error: No puede asignar un operador a una variable");
      } else if(typeVar === 2){
        console.log("Error: No puede asignar un operador a una vector");
      } else{
        console.log("Error: No puede asignar un operador a una vector");
      }
    } else if(instruction.value.value instanceof Relacional){
      if(typeVar === 1){
        console.log("Error: No puede asignar una relación a una variable");
      } else if(typeVar === 2){
        console.log("Error: No puede asignar una relación a una vector");
      } else{
        console.log("Error: No puede asignar una relación a una vector");
      }
    } else if(instruction.value.value instanceof Id){
      let found2 = this.generalFoundVariable(blockArray,instruction.value.value.valor,blockRow,blockCol);
      if(typeVar === 1){
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'variable'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'variable');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{console.log("Error: Quiere asignar una variable de diferentes dimensiones en una simple");}
          }else{console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type);}
        }else{console.log("Error: El id " + instruction.value.value.valor + " no existe");}
      } else if(typeVar === 2){
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'array'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'array');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
            }else{console.log("Error: Quiere asignar una variable de diferentes dimensiones en un vector");}
          }else{console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type);}
        }else{console.log("Error: El id " + instruction.value.value.valor + " no existe");}
      } else{
        if(found2 !== null){
          if(found2.tipo === type){
            if(found2.tipoVar === 'array_doble'){
              let newVariable = new VariableRun(type, instruction.value.tipo_var, found2.valor,'array_doble');
              this.addVariable(blockArray,blockFound.fila,blockFound.columna,newVariable);
           }else{console.log("Error: Quiere asignar una variable de diferentes dimensiones en un vector doble");}
          }else{console.log("Error: Quiere asignar una variable tipo " + found2.tipo + " en una tipo " + type);}
        }else{console.log("Error: El id " + instruction.value.value.valor + " no existe");}
      }
    } else if(instruction.value.value instanceof Llamada) {
      if(instruction.value.value.tipo === 'NORMAL'){
        console.log(instruction.value.value);
        let functionValue = this.returnValue(instruction.value.value,blockRow,blockCol,blockArray);
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
            console.log("El valor retornado no corresponde con el tipo de variable");
          }
        } else if(typeVar === 2){
          console.log("Error: No puede asignar un solo valor a un vector");
        } else{
          console.log("Error: No puede asignar un solo valor a un vector");
        }
      }else{
        //Funciones predeterminadas
      }
    }
  }
}