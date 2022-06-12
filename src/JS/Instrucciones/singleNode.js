class singleNode{
    constructor(fila,columna,name){
        this.fila = fila;
        this.columna = columna;
        this.name = name;
        this.sons = [];
    }

    addNode(newNode){
        this.sons.push(newNode);
    }
}