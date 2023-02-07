import connection from '../database/connection';
import convertLineToMetadaData from '../utils/convertLineToMetadaData';

class Contanct {

    async insertOrUpdate2(contato){

        return new Promise((resolve) => {

            let sql = `insert into CONTATO(
                DS_RESPOSTA
                ,DT_CONTATO
                ,DT_RESPOSTA
                ,IE_AUTORIZADO
                ,IE_FORMA_CONTATO
                ,DS_CPF
                ) values (
                :p_DS_RESPOSTA
                ,:p_DT_CONTATO
                ,:p_DT_RESPOSTA
                ,:p_IE_AUTORIZADO
                ,:p_IE_FORMA_CONTATO
                , :p_DS_CPF
                )`;
    
            let values =  [
                contato.ds_resposta,
                contato.dt_contato ,
                contato.dt_resposta,
                contato.ie_autorizado,
                contato.ie_forma_contato,
                contato.ds_cpf];
    
            connection.then( async function (conn ) { 
                let result =  await conn.execute('SELECT ie_autorizado FROM contato WHERE ds_cpf = :ds_cpf',[contato.ds_cpf]);
    
                //registro já existe na base, força o update caso o novo registro seja "não autorizado"
                if(result && result.rows && result.rows.length > 0){
                    if(contato.ie_autorizado == '' || contato.ie_autorizado == 'N'){
                         await conn.execute(`UPDATE contato 
                         SET  DS_RESPOSTA = :DS_RESPOSTA
                            ,DT_CONTATO     = :DT_CONTATO
                            ,DT_RESPOSTA    = :DT_RESPOSTA
                            ,IE_AUTORIZADO  = :IE_AUTORIZADO
                            ,IE_FORMA_CONTATO = :IE_FORMA_CONTATO
                        WHERE DS_CPF =:DS_CPF `, values,{ autoCommit: true });
                    }
                }else{
                      await conn.execute(sql, values,{ autoCommit: true });
                }
                
                resolve([]);
            });
            
        });
    }

    async loadContactToRequestAuthorization(sequences){

        return new Promise((resolve) => {
            let params = ':p0';
            for(let index =1; index < sequences.length ; index++){
                params = params +", :p"+index;
            }

            let sql = ` select 
                        p.nm_paciente, 
                        p.ds_cpf, p.ds_telefone ,  
                        TO_CHAR( sysdate, 'DD/MM/YYYY' )  dt_nascimento,  
                        p.ds_cpf ds_rg
            from        paciente p, contato c
            where       p.ds_cpf = c.ds_cpf
            and         c.ie_forma_contato = 'w' -- whats
            and         c.ie_autorizado is null
            and         p.nr_sequencia  in (`+params+`)
            group by    p.nm_paciente, p.ds_cpf, p.ds_telefone
            `;
    
            connection.then( async function (conn ) { 
                let result =  await conn.execute(sql, sequences);
                resolve(convertLineToMetadaData(result));
            });
            
        });
    }


    async loadContactToRequestAuthorizationCPF(cpfs){

        return new Promise((resolve) => {
            let params = ':p0';
            for(let index =1; index < cpfs.length ; index++){
                params = params +", :p"+index;
            }

            let sql = ` select p.nm_paciente, 
                        p.ds_cpf, 
                        p.ds_telefone ,  
                        TO_CHAR( sysdate, 'DD/MM/YYYY')  dt_nascimento,  
                        p.ds_cpf ds_rg
            from        paciente p, contato c
            where       p.ds_cpf = c.ds_cpf
            and         c.ie_forma_contato = 'w' -- whats
            and         c.ie_autorizado is null
            and         p.ds_cpf  in (`+params+`)
            group by    p.nm_paciente, p.ds_cpf, p.ds_telefone
            `;
    
            connection.then( async function (conn ) { 
                let result =  await conn.execute(sql, cpfs);
                resolve(convertLineToMetadaData(result));
            });
            
        });
    }

    async updateSendWhatsAppRequest(protocol, cpf, resolve){
        connection.then( async function (conn ) { 
            let result =  await conn.execute(
                `UPDATE contato
                SET     dt_contato      = sysdate,
                        ds_protocolo_whatsapp = :protocol,
                        ie_autorizado   = 'E'
                WHERE   DS_CPF = :cpf`,
                [protocol, cpf],
                { autoCommit: true });
            resolve([]);
        });
    }

    async updateResposeWhatsApp(cpf, response, date ){

        return new Promise((resolve) => {

            connection.then( async function (conn ) { 
                let result =  await conn.execute(
                    `UPDATE contato
                    SET     DT_RESPOSTA      = :DT_RESPOSTA,
                            IE_AUTORIZADO = :IE_AUTORIZADO
                    WHERE   DS_CPF = :cpf`,
                    [ date, response, cpf ],
                    { autoCommit: true });
                resolve([]);
            });
        });
    }

}

export default new Contanct;