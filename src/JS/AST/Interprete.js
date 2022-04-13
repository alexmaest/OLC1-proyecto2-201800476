class Interprete {
  constructor() {
    this.variablesGlobales = [];
    this.funciones = [];
  }

  interpret(root) {
    this.analize(root);
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
        //console.log("Hola con Run");
      } else if (node[i] instanceof Funcion) {
        if (this.foundFunction(node[i].id)) {
          console.log("Error: Función " + node[i].id + " ya ha sido declarada");
        } else {
          this.funciones.push(new FuncionRun(node[i].id, []));
          if (node[i].parametros.length === 0) {
            for (let j = 0; j < node[i].bloque.Instrucciones.length; j++) {
              this.runInstructions(node[i].id, node[i].bloque.Instrucciones[j]);
            }
            console.log("Funcion sin parametros");
          } else {
            console.log("Funcion con parametros");
          }
        }
      }
    }
  }

  runInstructions(Function, instruction) {
    let tempFunction = this.returnFunction(Function);
    if (instruction instanceof Variable) {
      if (instruction.tipo_dec === "NORMAL") {
        let found = this.foundVariable(instruction.value, tempFunction.variables);
        if (!found) {
          tempFunction.variables.push(
            new VariableRun(instruction.tipo_var, instruction.value, null)
          );
        }
      } else if (instruction.tipo_dec === "SINGLE_ARRAY") {
        let found = this.foundVariable(instruction.value, tempFunction.variables);
        if (!found) {
          tempFunction.variables.push(
            new VariableRun(instruction.tipo_var, instruction.value, null)
          );
        }
      } else if (instruction.tipo_dec === "DOUBLE_ARRAY") {
        let found = this.foundVariable(instruction.value, tempFunction.variables);
        if (!found) {
          tempFunction.variables.push(
            new VariableRun(instruction.tipo_var, instruction.value, null)
          );
        }
      } else {
        let found = this.foundVariable(instruction.value.tipo_var, tempFunction.variables);
        if (!found) {
          if (instruction.value instanceof OperacionSimplificada) {
            let returnedVar = this.returnVar(
              instruction.value.valor,
              Function.id
            );
            if (returnedVar.tipo === "int" || returnedVar.tipo === "double") {
              if (instruction.value.tipo === "++") {
                returnedVar.valor = returnedVar.valor + 1;
              } else {
                returnedVar.valor = returnedVar.valor - 1;
              }
            } else {
              console.log(
                "Error en aumentar cantidad en una variable no numérica"
              );
              //Error en aumentar cantidad en una variable no numérica
            }
          } else {
            //Asignacion
            if (instruction.value.tipo_asg === "NORMAL") {
              if (instruction.value.value instanceof Operacion) {
                tempFunction.variables.push(
                  new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0], this.arithmetic(instruction.value.value)));
              } else if (instruction.value.value instanceof Negativo) {
                tempFunction.variables.push(
                  new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0], this.arithmetic(instruction.value.value)));
              } else if(instruction.value.value instanceof Valor){
                if(instruction.value.value.tipo === instruction.tipo_var){
                  tempFunction.variables.push(
                    new VariableRun(instruction.tipo_var, instruction.value.tipo_var[0], instruction.value.value));
                } else{
                  console.log("El valor asignado no corresponde con el tipo de variable");
                }
              } else if(instruction.value.value instanceof OperacionSimplificada){
              } else if(instruction.value.value instanceof Casteo){
              } else if(instruction.value.value instanceof nuevoArraySimple||nuevoArrayDoble||NuevoArray||AccesoArraySimple||AccesoArrayDoble){
              } else if(instruction.value.value instanceof Operador || Negacion || Relacional){
              }
            } else if (instruction.value.tipo_asg === "SINGLE_ARRAY") {
            } else if (instruction.value.tipo_asg === "DOUBLE_ARRAY") {
            }
          }
        }
      }
    } else if (instruction instanceof Asignacion) {
    } else if (instruction instanceof OperacionSimplificada) {
      let found = this.foundVariable(instruction.valor, tempFunction.variables);
      if (found) {
        let returnedVar = this.returnVar(
          instruction.valor,
          tempFunction.id
        );
        if (returnedVar.tipo === "int" || returnedVar.tipo === "double") {
          if (instruction.tipo === "++") {
            returnedVar.valor = returnedVar.valor + 1;
          } else {
            returnedVar.valor = returnedVar.valor - 1;
          }
        } else {
          console.log(
            "Error en aumentar cantidad en una variable no numérica"
          );
          //Error en aumentar cantidad en una variable no numérica
        }
      }
    } else if (instruction instanceof Llamada) {
    } else if (instruction instanceof If) {
    } else if (instruction instanceof Switch) {
    } else if (instruction instanceof While) {
    } else if (instruction instanceof For) {
    } else if (instruction instanceof DoWhile) {
    } else if (instruction instanceof Break) {
    } else if (instruction instanceof Return) {
    } else if (instruction instanceof Continue) {
    }
  }

  foundFunction(idFunction) {
    let found = false;
    for (let i = 0; i < this.funciones.length; i++) {
      if (idFunction === this.funciones[i].id) {
        found = true;
        break;
      }
    }
    if (found) {
      return true;
    } else {
      return false;
    }
  }

  foundVariable(idVariable, variables) {
    let found = false;
    for (let i = 0; i < variables.length; i++) {
      if (idVariable.toString() == variables[i].id.toString()) {
        found = true;
        break;
      }
    }
    if (found) {
      /*console.log(
        "La variable " + idVariable + " ya ha sido declarada localmente"
      );*/
      return true;
    } else {
      let found2 = false;
      for (let i = 0; i < this.variablesGlobales.length; i++) {
        if (idFunction.toString() === this.variablesGlobales[i].id.toString()) {
          found2 = true;
          break;
        }
      }
      if (found2) {
        /*console.log(
          "La variable " + idVariable + " ya ha sido declarada globalmente"
        );*/
        return true;
      } else {
        return false;
      }
    }
  }

  returnFunction(idFunction) {
    for (let i = 0; i < this.funciones.length; i++) {
      if (idFunction === this.funciones[i].id) {
        return this.funciones[i];
      }
    }
    return null;
  }

  returnVar(idVar, idFunction) {
    let function1 = this.returnFunction(idFunction);
    for (let i = 0; i < function1.variables.length; i++) {
      if (idVar === function1.variables[i].id) {
        return function1.variables[i];
      }
    }
    return null;
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
  //7+7-1
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
    }
  }
}
