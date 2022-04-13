// VAMOS A INTERPRETAR

function final() {
  var content = document.getElementById('inConsole').value;
  try {
    //console.log("info ya recibida")
    console.log(content);
    var resultado = Grammar.parse(content);
    var interprete = new Interprete();
    interprete.analize(resultado);
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