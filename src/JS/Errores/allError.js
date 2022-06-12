var allError = (function(){
    var instance;

    class single{
        constructor(){
            this.errores=[];
        }

        addError(error){
            this.errores.push(error);
        }

        getErrores(){
            return this.errores;
        }
        restart(){
            this.errores = [];
        }
    }

    function create(){
        return new single();
    }

    return {
        listErrores:function(){
            if(!instance){
                instance = create();
            }
            return instance;
        }
    }
}());