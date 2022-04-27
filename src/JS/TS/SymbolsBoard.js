var SymbolsBoard = (function () {
  var instancia;

  class Tabla {
    constructor() {
      this.simbolos = [];
    }
    //Insertar un nuevo simbolo
    insertar(simbolos) {
      this.simbolos.push(simbolos);
    }
    // Por si necesitamos vaciar la tabla
    reiniciar() {
      this.simbolos = [];
    }
    // Vamos a obtener un simbolo
    obtener(nombre) {
      let res = null;
      this.simbolos.forEach((simbolo) => {
        if (simbolo.name == nombre) {
          res = simbolo;
        }
      });
      return res;
    }
    // Vamos a actualizar un simbolo
    modificar(simbol) {
      this.simbolos.forEach((simbolo) => {
        if (simbolo.name == simbol.name) {
          simbolo.value = simbol.value;
          simbolo.type = simbol.type;
        }
      });
    }

    // TABLA DE SIMBOLOS A HTML
    getsimbolos() {
      var texto = "";

      texto += `<html><head><title>Reporte de Tabla de Simbolos</title><style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            
            th, td {
              text-align: left;
              padding: 8px;
            }
            
            tr:nth-child(even){background-color: #f2f2f2}
            
            th {
              background-color: #4CAF50;
              color: white;
            }
            </style></head><body>
            <h1>Reporte de Tabla de Simbolos</h1>
            <table>
            <tr>
                <th>No.</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Valor</th>
            </tr>`;
      var cuenta = 1;
      this.simbolos.forEach((simbolo) => {
        texto += "<tr>\n";
        texto += "<td>" + cuenta + "</td>\n";
        texto += "<td>" + simbolo.name + "</td>\n";
        texto += "<td>" + simbolo.type + "</td>\n";
        texto += "<td>" + simbolo.value + "</td>\n";
        texto += "</tr>";
        cuenta++;
      });
      texto += "</table></body></html>";

      return texto;
    }
  }

  function CrearInstancia() {
    return new Tabla();
  }

  return {
    getInstance: function () {
      if (!instancia) {
        instancia = CrearInstancia();
      }
      return instancia;
    },
  };
})();
