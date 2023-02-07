import connection from '../database/connection';

class Government {

    async getPatients( sequences, callback){

        let pai=this;

        let params = ':p0';
        for(let index =1; index < sequences.length ; index++){
            params = params +", :p"+index;
        }


        connection.then( conn => { 
      
            const result =  conn.execute(
            `
            select 
                    p.NR_SEQUENCIA,
                    p.DS_CPF,
                    p.DS_IMUNOBIOLOGICO, 
                    to_char(p.DT_ADMINISTRACAO, 'YYYY-MM-DD') DT_ADMINISTRACAO,
                    p.DS_FABRICANTE, 
                    p.DS_LOTE, 
                    to_char(p.DT_VALIDADE, 'YYYY-MM-DD') DT_VALIDADE,
                    p.DS_LOCAL_APLICACAO, 
                    p.IE_VIA_ADMINISTRACAO, 
                    p.CD_CNS_PROFISSIONAL, 
                    p.CD_ESTRATEGIA, 
                    p.DS_PROTOCOLO_ANVISA,        
                    p.DS_PROTOCOLO_VERSAO,          
                    p.DS_REGISTRO_ANVISA, 
                    p.nr_dose      
            from    paciente p, 
                    contato c
            where   p.ds_cpf = c.ds_cpf
            and p.ds_cpf in  (` +params+ `)
            and c.ie_autorizado = 'A'
            and (p.ie_status_envio <> 'T' or p.ie_status_envio is null)
            order by p.ds_cpf, p.nr_dose
            `,
            
            sequences,
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( []);
                }else{
                   let line =  pai.convertLineToMetadaData(result);
                   callback(line);
                }
                return;
            });
        })
        
        .catch(function(e) {
            console.log(e);
          });
        
        ;
    }

    convertLineToMetadaData(result){

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

    }

    async update(params, callback){
        connection.then( conn => { 
      
            let sql =  `UPDATE paciente 
            SET IE_STATUS_ENVIO         = :IE_STATUS_ENVIO,
            ID_UNICO                    = :ID_UNICO,
            DS_CONTEUDO_HL7             = :DS_CONTEUDO_HL7   ,  
            DS_RETORNO_GOVERNO          = :DS_RETORNO_GOVERNO ,
            DT_ENVIO_GOVERNO            = SYSDATE,
            NR_USUARIO_ENVIO            =:NR_USUARIO_ENVIO  
            WHERE       NR_SEQUENCIA = :NR_SEQUENCIA `;
             conn.execute(sql, params,{ autoCommit: true });
        });
    }

    loadStatus(cpf, callback) {

        var that = this;
        connection.then( conn => { 
      
            const result =  conn.execute(
            `
            select 
                    p.IE_STATUS_ENVIO,
                    p.DS_CONTEUDO_HL7,
                    p.DS_RETORNO_GOVERNO, 
                    to_char(p.DT_ENVIO_GOVERNO, 'dd/MM/YYYY hh24:mi') DT_ENVIO_GOVERNO ,
                    p.nr_dose,
                    p.nr_sequencia      
            from    paciente p
            where   p.ds_cpf = :ds_cpf
            order by  p.nr_dose
            `,
            
            [cpf],
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( []);
                }else{
                   let line =  that.convertLineToMetadaData(result);
                   callback(line);
                }
                return;
            });
        })
        
        .catch(function(e) {
            console.log(e);
        });
        
    }

}

export default new Government;