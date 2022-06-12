var singleBloques;
var singleInterprete;
var content;
var counter = 0;

function final() {
  content = document.getElementById('inConsole').value;
  try {
    console.log(content);
    allError.listErrores().restart();
    var resultado = Grammar.parse(content);
    singleInterprete = new Interprete();
    singleInterprete.analize(resultado);
    singleBloques = singleInterprete.bloques;
    let text = "";
    let fails = allError.listErrores().getErrores();
    let fails2 = singleInterprete.getErrores();
    for(let i=0; i < fails.length; i++){
      text += fails[i].valor + ", fila: " + fails[i].fila + ", columna: " + fails[i].columna + "\n";
    }
    for(let i=0; i < fails2.length; i++){
      text += fails2[i].valor + ", fila: " + fails2[i].fila + ", columna: " + fails2[i].columna + "\n";
    }
    text += singleInterprete.getConsoleText();
    document.getElementById('outConsole').value = text;
    return;
  } catch (error) {
    console.log(error);
    return;
  }
}

function generateAST(){
  var resultado = treeAst.parse(content);
  UpdateGraphviz(generar(resultado));
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

function generar(nodes){
  let gText = `digraph G{\n
  Node0[label=\"RAIZ\"];\n`;
  counter = 0
  nodesPrint(nodes);
  gText += "}";
  console.log(gText);
  return gText;

  function nodesPrint(sNodes){
    let temp = counter;
    if(sNodes instanceof singleNode){
      gText += "Node" + (counter+1) + "[label=\"" + sNodes.name + "\"];\n";
      gText += "Node" + (temp) + " -> Node" + (counter+1) + ";\n";
      let temp2 = counter+1;
      counter++;
      for(let j = 0; j < sNodes.sons.length; j++){
        if(sNodes.sons[j].name === undefined){return;}
        if(sNodes.sons[j].name instanceof singleNode || sNodes.sons[j].name instanceof Array){
          nodesPrint(sNodes.sons[j].name);
        }else{
          gText += "Node" + (counter+1) + "[label=\"" + sNodes.sons[j].name + "\"];\n";
          gText += "Node" + (temp2) + " -> Node" + (counter+1) + ";\n";
          counter++;
        }
      }
    }else{
      for(let i = 0; i < sNodes.length; i++){
        gText += "Node" + (counter+1) + "[label=\"" + sNodes[i].name + "\"];\n";
        gText += "Node" + (temp) + " -> Node" + (counter+1) + ";\n";
        let temp2 = counter+1;
        counter++;
        if(sNodes[i].sons instanceof singleNode){
          nodesPrint(sNodes[i].sons);
        } else if(sNodes[i].name instanceof Array){
          nodesPrint(sNodes[i].name);
        }else{
          if(sNodes[i].sons === undefined){return;}
          for(let j = 0; j < sNodes[i].sons.length; j++){
            if(sNodes[i].sons[j].name instanceof singleNode){
              nodesPrint(sNodes[i].sons[j].name);
            } else if(sNodes[i].sons[j].name instanceof Array){
              nodesPrint(sNodes[i].sons[j].name);
            }else{
              gText += "Node" + (counter+1) + "[label=\"" + sNodes[i].sons[j].name + "\"];\n";
              gText += "Node" + (temp2) + " -> Node" + (counter+1) + ";\n";
              counter++;
            }
          }
        }
      }
    }
  }
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

function generateErrorReport(){
  let htmlText = `<!DOCTYPE html>
  <html lang="en">

  <head>

      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="description" content="">
      <meta name="author" content="TemplateMo">
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700" rel="stylesheet">

      <title>Reporte</title>

      <!-- Bootstrap core CSS -->
      <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">

      <!-- Additional CSS Files -->
      <link rel="stylesheet" href="assets/css/fontawesome.css">
      <link rel="stylesheet" href="assets/css/templatemo-host-cloud.css">
      <link rel="stylesheet" href="assets/css/owl.css">
  <!--

  Host Cloud Template

  https://templatemo.com/tm-541-host-cloud

  -->
  </head>

  <body style="background-color: black;">
<!-- Header -->
<header class="">
<nav class="navbar navbar-expand-lg">
  <div class="container">
  <a class="navbar-brand" href="reporte_Errores.html"><h2>Reportes<em>OLC1</em></h2></a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarResponsive">
      <ul class="navbar-nav ml-auto">
      </ul>
  </div>
  <div class="functional-buttons">
  </div>
  </div>
</nav>
</header>

<!-- Page Content -->
<!-- Banner Starts Here -->
<div class="banner">
<div class="container">
  <div class="row">
  <div class="col-md-8 offset-md-2">
      <div class="header-text caption">
      <h2 style="color: white">Reporte de</h2>
      <h1 style="color: #e6c012; font-size:120px; text-align: center; font-style: italic; font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; text-transform:uppercase">Errores</h1>
      </div>
  </div>
  </div>
</div>
</div><div style="padding-bottom: 100px;" class="services-section">
      <div class="container">
          <div class="row">
              <div class="col-md-8 offset-md-2">
                  <div class="section-heading">
                  <h2 style="color:white; text-transform:uppercase; text-align: center;">Errores</h2>
                  </div>
                  <table class="table">
                  <thead style="color:white; background-color:#db6918; text-transform:uppercase; text-align: center;">
                    <tr>
                      <th scope="col">Tipo</th>
                      <th scope="col">Descripción</th>
                      <th scope="col">Linea</th>
                      <th scope="col">Columna</th>
                    </tr>
                  </thead>
                  <tbody style="color:white;">`;
                  let fails = allError.listErrores().getErrores();
                  for(let i=0; i < fails.length; i++){
                    if(fails[i] instanceof lexicError){
                      htmlText += `<tr>
                      <td style="text-align: center;">Lexico</td>
                      <td style="text-align: center;">`+fails[i].valor+`</td>
                      <td style="text-align: center;">`+fails[i].fila+`</td>
                      <td style="text-align: center;">`+fails[i].columna+`</td>
                    </tr>`;
                    }else{
                      htmlText += `<tr>
                      <td style="text-align: center;">Sintáctico</td>
                      <td style="text-align: center;">`+fails[i].valor+`</td>
                      <td style="text-align: center;">`+fails[i].fila+`</td>
                      <td style="text-align: center;">`+fails[i].columna+`</td>
                    </tr>`;
                    }
                  }
                  let fails2 = singleInterprete.getErrores();
                  for(let i=0; i < fails2.length; i++){
                    htmlText += `<tr>
                      <td style="text-align: center;">Semántico</td>
                      <td style="text-align: center;">`+fails2[i].valor+`</td>
                      <td style="text-align: center;">`+fails2[i].fila+`</td>
                      <td style="text-align: center;">`+fails2[i].columna+`</td>
                    </tr>`;
                  }
                  htmlText += `</tbody>
                </table>
              </div>
          </div>
          </div>
      </div>
      </div><script src="vendor/jquery/jquery.min.js"></script>
      <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

      <!-- Additional Scripts -->
      <script src="assets/js/custom.js"></script>
      <script src="assets/js/owl.js"></script>
      <script src="assets/js/accordions.js"></script>


      <script language = "text/Javascript"> 
      cleared[0] = cleared[1] = cleared[2] = 0; //set a cleared flag for each field
      function clearField(t){                   //declaring the array outside of the
      if(! cleared[t.id]){                      // function makes it static and global
          cleared[t.id] = 1;  // you could use true and false, but that's more typing
          t.value='';         // with more chance of typos
          t.style.color='#fff';
          }
      }
      </script>
  </body>
  </html>`;
  download(htmlText,"ReporteErrores.html","text/html");
}

function generateSymbolReport(){
  let htmlText = `<!DOCTYPE html>
  <html lang="en">

  <head>

      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <meta name="description" content="">
      <meta name="author" content="TemplateMo">
      <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700" rel="stylesheet">

      <title>Reporte</title>

      <!-- Bootstrap core CSS -->
      <link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">

      <!-- Additional CSS Files -->
      <link rel="stylesheet" href="assets/css/fontawesome.css">
      <link rel="stylesheet" href="assets/css/templatemo-host-cloud.css">
      <link rel="stylesheet" href="assets/css/owl.css">
  <!--

  Host Cloud Template

  https://templatemo.com/tm-541-host-cloud

  -->
  </head>

  <body style="background-color: black;">
<!-- Header -->
<header class="">
<nav class="navbar navbar-expand-lg">
  <div class="container">
  <a class="navbar-brand" href="ReporteSimbolos.html"><h2>Reportes<em>OLC1</em></h2></a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
  </button>
  <div class="collapse navbar-collapse" id="navbarResponsive">
      <ul class="navbar-nav ml-auto">
      </ul>
  </div>
  <div class="functional-buttons">
  </div>
  </div>
</nav>
</header>

<!-- Page Content -->
<!-- Banner Starts Here -->
<div class="banner">
<div class="container">
  <div class="row">
  <div class="col-md-8 offset-md-2">
      <div class="header-text caption">
      <h2 style="color: white">Reporte de</h2>
      <h1 style="color: #e6c012; font-size:120px; text-align: center; font-style: italic; font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; text-transform:uppercase">Simbolos</h1>
      </div>
  </div>
  </div>
</div>
</div><div style="padding-bottom: 100px;" class="services-section">
      <div class="container">
          <div class="row">
              <div class="col-md-8 offset-md-2">
                  <div class="section-heading">
                  <h2 style="color:white; text-transform:uppercase; text-align: center;">Simbolos</h2>
                  </div>
                  <table class="table">
                  <thead style="color:white; background-color:#db6918; text-transform:uppercase; text-align: center;">
                    <tr>
                      <th scope="col">Simbolo</th>
                      <th scope="col">Linea</th>
                      <th scope="col">Columna</th>
                    </tr>
                  </thead>
                  <tbody style="color:white;">`;
                  var resultado = treeAst.parse(content);
                  gridPrint(resultado);

                  function gridPrint(sNodes){
                    if(sNodes instanceof singleNode){
                      htmlText += `<tr>
                              <td style="text-align: center;">`+sNodes.name+`</td>
                              <td style="text-align: center;">`+sNodes.fila+`</td>
                              <td style="text-align: center;">`+sNodes.columna+`</td>
                            </tr>`;
                      for(let j = 0; j < sNodes.sons.length; j++){
                        if(sNodes.sons[j].name === undefined){return;}
                        if(sNodes.sons[j].name instanceof singleNode || sNodes.sons[j].name instanceof Array){
                          gridPrint(sNodes.sons[j].name);
                        }else{
                          htmlText += `<tr>
                              <td style="text-align: center;">`+sNodes.sons[j].name+`</td>
                              <td style="text-align: center;">`+sNodes.sons[j].fila+`</td>
                              <td style="text-align: center;">`+sNodes.sons[j].columna+`</td>
                            </tr>`;
                        }
                      }
                    }else{
                      for(let i = 0; i < sNodes.length; i++){
                        htmlText += `<tr>
                              <td style="text-align: center;">`+sNodes[i].name+`</td>
                              <td style="text-align: center;">`+sNodes[i].fila+`</td>
                              <td style="text-align: center;">`+sNodes[i].columna+`</td>
                            </tr>`;
                        if(sNodes[i].sons instanceof singleNode){
                          gridPrint(sNodes[i].sons);
                        } else if(sNodes[i].name instanceof Array){
                          gridPrint(sNodes[i].name);
                        }else{
                          if(sNodes[i].sons === undefined){return;}
                          for(let j = 0; j < sNodes[i].sons.length; j++){
                            if(sNodes[i].sons[j].name instanceof singleNode){
                              gridPrint(sNodes[i].sons[j].name);
                            } else if(sNodes[i].sons[j].name instanceof Array){
                              gridPrint(sNodes[i].sons[j].name);
                            }else{
                              htmlText += `<tr>
                              <td style="text-align: center;">`+sNodes[i].sons[j].name+`</td>
                              <td style="text-align: center;">`+sNodes[i].sons[j].fila+`</td>
                              <td style="text-align: center;">`+sNodes[i].sons[j].columna+`</td>
                            </tr>`;
                            }
                          }
                        }
                      }
                    }
                  }
                  htmlText += `</tbody>
                </table>
              </div>
          </div>
          </div>
      </div>
      </div><script src="vendor/jquery/jquery.min.js"></script>
      <script src="vendor/bootstrap/js/bootstrap.bundle.min.js"></script>

      <!-- Additional Scripts -->
      <script src="assets/js/custom.js"></script>
      <script src="assets/js/owl.js"></script>
      <script src="assets/js/accordions.js"></script>


      <script language = "text/Javascript"> 
      cleared[0] = cleared[1] = cleared[2] = 0; //set a cleared flag for each field
      function clearField(t){                   //declaring the array outside of the
      if(! cleared[t.id]){                      // function makes it static and global
          cleared[t.id] = 1;  // you could use true and false, but that's more typing
          t.value='';         // with more chance of typos
          t.style.color='#fff';
          }
      }
      </script>
  </body>
  </html>`;
  download(htmlText,"ReporteSimbolos.html","text/html");
}