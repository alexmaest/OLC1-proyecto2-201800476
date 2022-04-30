// VAMOS A INTERPRETAR

function final() {
  var content = document.getElementById('inConsole').value;
  try {
    //console.log("info ya recibida")
    console.log(content);
    var resultado = Grammar.parse(content);
    var interprete = new Interprete();
    interprete.analize(resultado);
    UpdateGraphviz(imprimir(interprete.bloques));
    //console.log(interprete.getConsoleText());
    document.getElementById('outConsole').value = interprete.getConsoleText();

    return;
  } catch (error) {
    //consola.value = error + "\n" + L_Error.getInstance().getErrores();
    console.log(error);
    return;
  }
}

function clickElem(elem) {
  var eventMouse = document.createEvent("MouseEvents")
  eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  elem.dispatchEvent(eventMouse)
}

function openFile() {
  readFile = function(e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var contents = e.target.result;
      console.log(contents);
      document.getElementById('inConsole').value = contents;
    }
    reader.readAsText(file)
  }
  fileInput = document.createElement("input")
  fileInput.type='file'
  fileInput.style.display='none'
  fileInput.onchange=readFile
 
  clickElem(fileInput)
}

function imprimir(bloques){
  var gText ="";
  gText +="digraph G{\n";
  gText +="Node0[label=\"" + bloques[0].nombre + "\"];\n";

  gText += blocksPrint(gText,bloques[0],0);

  gText += "}";
  console.log(gText);
  return gText;
}

function blocksPrint(gText,bloques,father){
  let init = father;
  for(let i = 0; i < bloques.bloques.length; i++){
    gText += "Node" + (father+1) + "[label=\"" + bloques.bloques[i].nombre + "\"];\n";
    gText += "Node" + (father) + " -> Node" + (father+1) + ";\n";
    if(bloques.bloques[i].bloques.length !== 0){
      gText += blocksPrint(gText,bloques.bloques[i].bloques,(father+1))
    }
    father++;
    if(bloques.variables.length !== 0){
      gText += variablesPrint(gText,bloques.variables[i],variables,init,father)
    }
    if(bloques.bloques[i].variables.length !== 0){
      gText += variablesPrint(gText,bloques.bloques[i].variables,init,father)
    }
  }
  return gText;
}

function variablesPrint(gText,variables,father,last){
  for(let i = 0; i < variables.length; i++){
    gText += "Node" + (last+1) + "[label=\"" + variables[i].id + "\"];\n";
    gText += "Node" + (father) + " -> Node" + (last+1) + ";\n";
  }
  return gText;
}

var svg_div = jQuery('#graphviz_svg_div');
function UpdateGraphviz(dot) {
  svg_div.html("");
    var data = dot;
    var svg = Viz(data, "svg");
    download(svg,"ArbolAST.html","text/html");
}

function download(text, name, type) {
  var a = document.createElement('a');
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();
  a.remove();
}