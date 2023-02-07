import connection from '../database/connection';

class Patient {


    async insert2(patient ){

        let sql = `insert into PACIENTE(
            NR_SEQUENCIA
            ,NM_PACIENTE
            ,DS_CPF
            ,DS_TELEFONE
            ,CD_CNES
            ,CD_CNS_PROFISSIONAL
            ,DS_PROTOCOLO_ANVISA
            ,DS_PROTOCOLO_VERSAO
            ,DS_REGISTRO_ANVISA
            ,DT_ADMINISTRACAO
            ,DS_IMUNOBIOLOGICO
            ,DS_FABRICANTE
            ,DS_LOTE
            ,NR_DOSE
            ,IE_VIA_ADMINISTRACAO
            ,DS_LOCAL_APLICACAO
            ,DT_VALIDADE
            ,CD_ESTRATEGIA
            ,DS_UF
            ,DS_ID
            ,DT_IMPORTACAO
            ,NR_USUARIO_IMPORTACAO
           
           ) values (
            :0, :1, :2, :3, :4, :5, :6, :7,  :8, to_date(:DT_ADMINISTRACAO, 'YYYY-MM-DD') , :10, 
            :11, :12, :13, :14, :15,  to_date(:DT_VALIDADE, 'YYYY-MM-DD'), :17, :18, :19, sysdate, :20
           )`;
//TODO TODO TODO datas como string
        return new Promise((resolve) => {
         
            connection.then( conn => { 
                this.getByManufacturerAndDose(conn, patient, async function(data) {
                    if(data == 0){
    
                        let id = await conn.execute('SELECT PACIENTE_SEQ.nextVal from dual', [],{ autoCommit: true } );
    
                        let values =  [
                            id.rows[0][0],
                            patient.name ,
                            patient.cpf,
                            patient.phone,
                            patient.cnes,
                            patient.prof_cns,
                            patient.anvisa_protocol,
                            patient.anvisa_protocol_version,
                            patient.anvisa_number,
                            patient.adminstration_date,
                            patient.immunobiological,
                            patient.manufacturer,
                            patient.batch,
                            patient.dose, 
                            patient.adminstration_route,
                            patient.locale,
                            patient.validate,
                            patient.strategy,
                            patient.uf,
                            patient.id,
                            patient.nr_user];
                        let result =  await conn.execute(sql, values,{ autoCommit: true });
                        resolve( id.rows[0][0]);
                        
                    }else{
                        console.log('Nao add > ',patient)
                        resolve(-1);
                    }
                });
            });
        });
    }

    /**
     * Para saber se não é registro duplicado
     * @param {*} conn 
     * @param {*} patient 
     * @param {*} callback 
     */
    async getByManufacturerAndDose(conn, patient, callback){
        let values =  [
            patient.cpf,
            patient.manufacturer,
            patient.dose.toString()
        ];
        const result = await conn.execute(
            `SELECT count(*) qtd
             FROM PACIENTE
             WHERE DS_CPF = :ds_cpf AND DS_FABRICANTE = :DS_FABRICANTE AND NR_DOSE = :NR_DOSE`,
             values,  // bind value for :id
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( -1);
                }else{
                    callback(result && result !=undefined && result.rows ? result.rows[0][0]: 0);
                }
                return;
            }
          );
    }

    async listByPage(pageNumber, pageSize, callback){
        let pai=this;
        connection.then( conn => { 
      
            const result =  conn.execute(
            `SELECT * FROM
            (
                SELECT a.*, rownum r__
                FROM
                (
                    SELECT * FROM paciente WHERE ds_uf = :ds_uf
                ) a
                WHERE rownum < ((:pageNumber * :pageSize) + 1 )
            )
            WHERE r__ >= (((:pageNumber-1) * :pageSize) + 1)`,
             [ process.env.RNDS_REQUISITANTE_UF, pageNumber, pageSize,pageNumber, pageSize],  // bind value for :id
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
        });
    }


    async listSinglePatientByPage(pageNumber, pageSize, params, callback){

        let pai=this;

        var rest = this.loadParamsAndRestriction(params);
        let restricttion = rest.query;
        let paramsQ = rest.param;

      
        paramsQ.push(pageNumber);
        paramsQ.push( pageSize);
        paramsQ.push(pageNumber);
        paramsQ.push( pageSize);


        connection.then( conn => { 
      
            const result =  conn.execute(
            `SELECT * FROM
            (
                SELECT a.*, rownum r__
                FROM
                (
                    select   p.ds_cpf, 
                            p.nm_paciente, 
                            p.ds_uf, c.ie_autorizado, 
                            desc_contato(c.ie_autorizado) ds_autorizado, 
                            to_char(c.dt_resposta, 'dd/mm/yyyy hh24:mi') dt_resposta, 
                           
                            to_char(max( p.DT_ENVIO_GOVERNO), 'dd/mm/yyyy hh24:mi') DT_ENVIO_GOVERNO,
                            obter_status_governo(p.ds_cpf, c.ie_autorizado) DS_STATUS_TRANSMISSAO
                    from    paciente p, 
                            contato c
                    where   p.ds_cpf = c.ds_cpf
                    and     ds_uf   = :ds_uf

                    ` + restricttion + `
                    group by p.ds_cpf, 
                            p.nm_paciente,  
                            p.ds_uf, c.ie_autorizado, 
                            c.dt_resposta
                    ) a
                WHERE rownum < ((:pageNumber * :pageSize) + 1 )
            )
            WHERE r__ >= (((:pageNumber-1) * :pageSize) + 1)`,
            
            paramsQ,
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


    loadParamsAndRestriction(params) {

        let restricttion = '';
    
        let paramsQ = [];
        paramsQ.push(process.env.RNDS_REQUISITANTE_UF);
    
        if(params.state) {
            restricttion += ' AND upper(p.DS_UF) = upper(:DS_UF) ';
            paramsQ.push(params.state);
        }
    
        if(params.transData) {
            restricttion += ' AND p.DT_ENVIO_GOVERNO = :DT_ENVIO_GOVERNO ';
            paramsQ.push(params.transData);
        }
    
        if(params.transStatus) {
            if(params.transStatus === 'A'){
                restricttion += ' AND (upper(p.IE_STATUS_ENVIO) is null OR p.IE_STATUS_ENVIO = \'\')';
            } else{
                restricttion += ' AND upper(p.IE_STATUS_ENVIO) = upper(:IE_STATUS_ENVIO) ';
                paramsQ.push(params.transStatus);
            }   
        }
    
        if(params.authDate) {
            restricttion += ' AND c.DT_CONTATO = :DT_CONTATO ';
            paramsQ.push(params.authDate);
        }
    
        if(params.authStatus ) {
            if(params.authStatus === 'NE') {
                //NE -> Não enviado - filtra somente os registros em branco
                restricttion += ' AND c.IE_AUTORIZADO is null ';
               
            } else {
                restricttion += ' AND upper(c.IE_AUTORIZADO) = upper(:IE_AUTORIZADO) ';
                paramsQ.push(params.authStatus === 'NE' ? null : params.authStatus); 
            }       
        }
    
        if(params.name) {
            restricttion += 'AND (p.nm_paciente = :NM_PACIENTE or p.ds_cpf = :DS_CPF) ';
            paramsQ.push(params.name);
            paramsQ.push(params.name);
        }
        return {query:restricttion, param: paramsQ };
    }


    async countQuery(params, callback){
    
        var rest = this.loadParamsAndRestriction(params);
        let restricttion = rest.query;
        let paramsQ = rest.param;
  

       
        connection.then( conn => { 
      
            const result =  conn.execute(
            `select count(*) from (
                select   p.ds_cpf, 
                        p.nm_paciente, 
                        p.ds_uf, 
                        c.ie_autorizado, 
                        desc_contato(c.ie_autorizado) ds_autorizado, 
                        to_char(c.dt_resposta, 'dd/mm/yyyy hh24:mi') dt_resposta, 
                        to_char(max( p.DT_ENVIO_GOVERNO), 'dd/mm/yyyy hh24:mi') DT_ENVIO_GOVERNO,
                        obter_status_governo(p.ds_cpf, c.ie_autorizado) DS_STATUS_TRANSMISSAO
                from    paciente p, 
                        contato c
                where   p.ds_cpf = c.ds_cpf
                and     ds_uf   = :ds_uf
                ` + restricttion + `
                group by p.ds_cpf, 
                        p.nm_paciente,  
                        p.ds_uf, c.ie_autorizado, 
                        c.dt_resposta     
                ) a`
            ,
            paramsQ,  
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback( -1);
                }else{
                    callback(result && result !=undefined && result.rows ? result.rows[0][0]: 0);
                }
                return;
            });
        });
    }


    async getByCPF(cpf, callback){
        const that = this;
        connection.then( conn => { 
      
            const result =  conn.execute(
            `SELECT 
                    CD_CNS_PROFISSIONAL,
                    CD_ESTRATEGIA,
                    DS_CPF,
                    DS_FABRICANTE,
                    DS_ID,
                    DS_IMUNOBIOLOGICO,
                    DS_LOCAL_APLICACAO,
                    DS_LOTE,
                    DS_PROTOCOLO_ANVISA,
                    DS_PROTOCOLO_VERSAO,
                    DS_REGISTRO_ANVISA,
                    DS_TELEFONE,
                    to_char(DT_ADMINISTRACAO, 'YYYY-MM-dd')  DT_ADMINISTRACAO,
                    to_char(DT_VALIDADE, 'YYYY-MM-dd') DT_VALIDADE,
                    IE_VIA_ADMINISTRACAO,
                    NM_PACIENTE,
                    NR_DOSE,
                    NR_SEQUENCIA
            FROM paciente 
            WHERE ds_cpf =:ds_cpf 
            ORDER BY nr_dose`,
             [cpf],  
             function (err, result) {
                if (err) {
                    console.error(err.message);
                    callback([]);
                }else{
                    let line =  that.convertLineToMetadaData(result);
                    callback(line);
                }
                return;
            });
        });
    }


    


    async updateContato(patient){

        return new Promise((resolve, reject) => {
         
            connection.then( conn => { 
      
                const result =  conn.execute(
                `update contato
                set ds_cpf = :ds_cpf
                where ds_cpf = (select ds_cpf from paciente where nr_sequencia = :nr_sequencia) `,
                [ patient['DS_CPF'],                     
                patient['NR_SEQUENCIA']],
                { autoCommit: true },  
                 function (err, result, ) {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                    }else{
                        resolve(result && result !=undefined ? result.rows : []);
                    }
                });
            });
        });
    }

    async update(patient){

        return new Promise((resolve, reject) => {
         
            connection.then( conn => { 
      
                const result =  conn.execute(
                `UPDATE paciente 
                SET nm_paciente         = :nm_paciente,
                ds_cpf                  = :ds_cpf   ,  
                ds_telefone             = :ds_telefone   ,  
                cd_cns_profissional     = :cd_cns_profissional   ,  
                ds_protocolo_anvisa     = :ds_protocolo_anvisa   ,  
                ds_protocolo_versao     = :ds_protocolo_versao   ,  
                ds_registro_anvisa      = :ds_registro_anvisa   ,  
                dt_administracao        = to_date(:dt_administracao, 'YYYY-MM-DD'),            
                ds_fabricante           = :ds_fabricante   ,  
                ds_imunobiologico       = :ds_imunobiologico   ,  
                ds_lote                 = :ds_lote   ,  
                nr_dose                 = :nr_dose   ,          
                ie_via_administracao    = :ie_via_administracao   ,  
                ds_local_aplicacao      = :ds_local_aplicacao ,
                dt_validade             =  to_date(:dt_validade, 'YYYY-MM-DD'),
                ds_id                   = :ds_id,
                cd_estrategia           = :cd_estrategia,
                dt_alteracao            = sysdate,
                nr_usuario_edicao       = :nr_usuario_edicao  
                WHERE nr_sequencia =:nr_sequencia `,
                [patient['NM_PACIENTE'], 
                patient['DS_CPF'],                     
                patient['DS_TELEFONE'],    
                patient['CD_CNS_PROFISSIONAL'],
                patient['DS_PROTOCOLO_ANVISA'],
                patient['DS_PROTOCOLO_VERSAO'],
                patient['DS_REGISTRO_ANVISA'],
                patient['DT_ADMINISTRACAO'],                 
                patient['DS_FABRICANTE'],
                patient['DS_IMUNOBIOLOGICO'],
                patient['DS_LOTE'],
                patient['NR_DOSE'],                                
                patient['IE_VIA_ADMINISTRACAO'],
                patient['DS_LOCAL_APLICACAO'],
                patient['DT_VALIDADE'],
                patient['DS_ID'],
                patient['CD_ESTRATEGIA'],
                patient['NR_USUARIO_EDICAO'],
                patient['NR_SEQUENCIA']],
                { autoCommit: true },  
                 function (err, result, ) {
                    if (err) {
                        console.error(err.message);
                        reject(err.message);
                    }else{
                        resolve(result && result !=undefined ? result.rows : []);
                    }
                });
            });
        });
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

}

export default new Patient;