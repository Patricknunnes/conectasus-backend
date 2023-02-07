
const convertLineToMetadaData = (result) => {

    if(result && result.rows){
        let metadata = result.metaData;
        let lista = new Array(0);

        result.rows.forEach((linha) => {

            let line = {};
            linha.forEach((campo, idx) => {
                line[metadata[idx].name] = campo;
            });

            lista.push(line);
          });
          return lista;
    }
    return [];
};



export default convertLineToMetadaData;
