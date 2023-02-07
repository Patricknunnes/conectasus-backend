import connection from '../database/connection';
import convertLineToMetadaData from '../utils/convertLineToMetadaData';

class ModifyDate {

    async getAllToUpdate(  callback){

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
            p.DS_PROTOCOLO_ANVISA    ,        
            p.DS_PROTOCOLO_VERSAO   ,          
            p.DS_REGISTRO_ANVISA , 
            p.nr_dose    ,
            p.DS_RETORNO_GOVERNO,
            p.IE_STATUS_ENVIO_CORRECAO,
            p.ID_UNICO
        
            from    paciente p
            where   (IE_CORRIGIR_GOV_ADM = 'S' OR IE_CORRIGIR_GOV_VAL = 'S')
            and     ds_uf = :ds_uf
            and     (IE_STATUS_ENVIO_CORRECAO is null)
            and     IE_STATUS_ENVIO = 'T'
            
            order by nr_sequencia desc
            
            `, //TODO : sugestão testar um primeiro
            
            [ process.env.RNDS_REQUISITANTE_UF],
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( []);
                }else{
                   let line =  convertLineToMetadaData(result);
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
    
    async getHowWasSendGov(   patientRow, callback){

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
            p.DS_PROTOCOLO_ANVISA    ,        
            p.DS_PROTOCOLO_VERSAO   ,          
            p.DS_REGISTRO_ANVISA , 
            p.nr_dose    ,
            p.DS_RETORNO_GOVERNO

            from    paciente p
            where   p.ds_cpf in  (:ds_cpf1, :ds_cpf2)
            and p.nr_dose = :nr_dose
            `,
            
            [ patientRow.cpf, patientRow.cpf_antigo,patientRow.dose],
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( []);
                }else{
                   let line =  convertLineToMetadaData(result);
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

    async updateToWrongDates(nrSeq, adm, validade, admdt, valdt, callback){
        connection.then( conn => { 
      
            let sql =  `UPDATE paciente p
            SET         p.IE_CORRIGIR_GOV_ADM        = :adm,
                        p.IE_CORRIGIR_GOV_VAL        = :val,
                        p.dt_adm_novo                = to_date(:dt_adm_novo, 'YYYY-MM-DD'),
                        p.dt_val_novo                = to_date(:dt_val_novo, 'YYYY-MM-DD')
            where       nr_sequencia = :nr_seq
             `;
             try{
             conn.execute(sql, 
                [ adm, validade, nrSeq,admdt, valdt ],
                { autoCommit: true });
             }catch(e){
                 console.log(e);
             }
        })
        .catch(function(e) {
            console.log(e);
          });
        
        ;
    }

    async updateData(params, callback){
        connection.then( conn => { 
      
            let sql =  `UPDATE paciente 
                        SET IE_STATUS_ENVIO_CORRECAO         = :IE_STATUS_ENVIO,
                        DS_RETORNO_GOVERNO_CORRECAO          = :DS_RETORNO_GOVERNO ,
                        DT_ENVIO_GOVERNO_CORRECAO            = SYSDATE  
            WHERE       NR_SEQUENCIA                         = :NR_SEQUENCIA `;
             conn.execute(sql, params,{ autoCommit: true });
        });
    }


    async updateNewData(params, callback){
        connection.then( conn => { 
      
            let sql =  `UPDATE paciente 
            SET IE_STATUS_ENVIO         = :IE_STATUS_ENVIO,
            IE_STATUS_ENVIO_CORRECAO    = 'X',
            ID_UNICO                    = :ID_UNICO,
            DS_CONTEUDO_HL7             = :DS_CONTEUDO_HL7   ,  
            DS_RETORNO_GOVERNO          = :DS_RETORNO_GOVERNO ,
            DT_ENVIO_GOVERNO            = SYSDATE  
            WHERE       NR_SEQUENCIA = :NR_SEQUENCIA `;
             conn.execute(sql, params,{ autoCommit: true });
        });
    }

}


export default new ModifyDate;