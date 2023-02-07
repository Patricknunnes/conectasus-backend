class Tables {
    init(connection) {
        this.connection = connection

        this.createContato();
        this.createLog();
        this.createLogSistema();
        this.createPatients();
        this.createStatus();
        this.createUser();
        this.createIndexes();
        this.createSequence();
        this.populate();
     
    }

    createSequence(){
        const sql = `CREATE SEQUENCE paciente_seq
        START WITH     1
        INCREMENT BY   1
        NOCACHE
        NOCYCLE`;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
            } else {
                console.log('Sequence paciente_seq criada com sucesso')
            }
        })
    }
    createPatients() {
        //todo: COMADO CREATE IF NOT EXISTS
        const sql = `   CREATE TABLE "PACIENTE"  

        (	"NR_SEQUENCIA" NUMBER,  
     
            "NM_PACIENTE" VARCHAR2(3000),  
            
            "DS_CPF" VARCHAR2(256),  
            
            "DS_TELEFONE" VARCHAR2(256),  
            
            "CD_CNES" VARCHAR2(256),  
            
            "CD_CNS_PROFISSIONAL" VARCHAR2(256),  
            
            "DS_PROTOCOLO_ANVISA" VARCHAR2(256),  
            
            "DS_PROTOCOLO_VERSAO" VARCHAR2(256),  
            
            "DS_REGISTRO_ANVISA" VARCHAR2(256),  
            
            "DT_ADMINISTRACAO" DATE,  
            
            "DS_FABRICANTE" VARCHAR2(256),  
            
            "DS_IMUNOBIOLOGICO" VARCHAR2(256),  
            
            "DS_LOTE" VARCHAR2(256),  
            
            "NR_DOSE" NUMBER,  
            
            "IE_VIA_ADMINISTRACAO" VARCHAR2(256),  
            
            "DS_LOCAL_APLICACAO" VARCHAR2(256),  
            
            "DT_IMPORTACAO" DATE,  
            
            "DT_ALTERACAO" DATE,  
            
            "DT_ENVIO_GOVERNO" DATE,  
            
            "IE_STATUS_ENVIO" VARCHAR2(50),  
            
            "DS_CONTEUDO_HL7" VARCHAR2(3000),  
            
            "DS_RETORNO_GOVERNO" VARCHAR2(3000),  
            
            "DS_UF" VARCHAR2(2),  
            
            "DT_VALIDADE" DATE,  
            
            "CD_ESTRATEGIA" VARCHAR2(20),  
            
            "DS_ID" VARCHAR2(256) 
            
        ) ;    `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
            } else {
                console.log('Tabela pacientes criada com sucesso')
            }
        });
    }

    createLog() {
        const sql = `
             CREATE TABLE "LOG_ACESSO"  
                    (	"NM_USUARIO" VARCHAR2(20),  
                    "NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
                    "DT_ACESSO" DATE 
                    ) ; 
            `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
                
            } else {
                console.log('Tabela LOG criada com sucesso')
            }
        });
    }

    createUser(){
        const sql = `CREATE TABLE "USUARIO"  
             (	"NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
            "NM_USUARIO" VARCHAR2(20),  
            "DS_SENHA" VARCHAR2(256),      
            "NM_PESSOA" VARCHAR2(256),   
            "DS_NIVEL" VARCHAR2(20) ) ; 
        `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
                
            } else {
                console.log('Tabela usuario criada com sucesso')
            }
        })
    }

    createStatus(){
        const sql = `  CREATE TABLE "STATUS_CONTATO"  
                (	"NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
                "IE_STATUS" VARCHAR2(1),  
                "DS_STATUS" VARCHAR2(50) 
                ) ; 
                
                CREATE TABLE "STATUS_GOVERNO"  
                (	"NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
                "DS_STATUS" VARCHAR2(50),  
                "IE_STATUS" VARCHAR2(5) 
                ) ; 
                
                CREATE TABLE "STATUS_RESPOSTA"  
                ("NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
                "IE_RESPOSTA" VARCHAR2(1),  
                "DS_RESPOSTA" VARCHAR2(50) 
                ) ; `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
                
            } else {
                console.log('Tabelas de status criada com sucesso')
            }
        })
    }

    createIndexes() {
        const sql = ` CREATE UNIQUE INDEX "CONTATO_PK" ON "CONTATO" ("NR_SEQUENCIA")  ; 

        CREATE UNIQUE INDEX "LOG_SISTEMA_PK" ON "LOG_SISTEMA" ("NR_SEQUENCIA")    ; 
      
        CREATE UNIQUE INDEX "PACIENT_PK" ON "PACIENTE" ("NR_SEQUENCIA")     ; 

        CREATE UNIQUE INDEX "STATUS_CONTATO_PK" ON "STATUS_CONTATO" ("NR_SEQUENCIA")     ; 
      
        CREATE UNIQUE INDEX "STATUS_GOVERNO_PK" ON "STATUS_GOVERNO" ("NR_SEQUENCIA")     ; 
      
        CREATE UNIQUE INDEX "STATUS_RESPOSTA_PK" ON "STATUS_RESPOSTA" ("NR_SEQUENCIA")   ; 

        CREATE UNIQUE INDEX "USUARIO_PK" ON "USUARIO" ("NR_SEQUENCIA")    ; 
      
        ALTER TABLE "CONTATO" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "CONTATO" ADD CONSTRAINT "CONTATO_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      
        ALTER TABLE "CONTATO" MODIFY ("DS_CPF" NOT NULL ENABLE); 

        ALTER TABLE "LOG_ACESSO" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "LOG_ACESSO" MODIFY ("DT_ACESSO" NOT NULL ENABLE); 
      
        ALTER TABLE "LOG_ACESSO" MODIFY ("NM_USUARIO" NOT NULL ENABLE); 

        ALTER TABLE "LOG_SISTEMA" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "LOG_SISTEMA" ADD CONSTRAINT "LOG_SISTEMA_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      
      
        ALTER TABLE "PACIENTE" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "PACIENTE" ADD CONSTRAINT "PACIENT_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      
      
        ALTER TABLE "STATUS_CONTATO" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "STATUS_CONTATO" MODIFY ("DS_STATUS" NOT NULL ENABLE); 
      
        ALTER TABLE "STATUS_CONTATO" ADD CONSTRAINT "STATUS_CONTATO_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      
     
        ALTER TABLE "STATUS_GOVERNO" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "STATUS_GOVERNO" ADD CONSTRAINT "STATUS_GOVERNO_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      
     
        ALTER TABLE "STATUS_RESPOSTA" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "STATUS_RESPOSTA" ADD CONSTRAINT "STATUS_RESPOSTA_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; 
      

        ALTER TABLE "USUARIO" MODIFY ("NR_SEQUENCIA" NOT NULL ENABLE); 
      
        ALTER TABLE "USUARIO" MODIFY ("NM_USUARIO" NOT NULL ENABLE); 
      
        ALTER TABLE "USUARIO" MODIFY ("DS_SENHA" NOT NULL ENABLE); 
      
        ALTER TABLE "USUARIO" ADD CONSTRAINT "USUARIO_PK" PRIMARY KEY ("NR_SEQUENCIA") 
      
        USING INDEX  ENABLE; `;
    }


    createLogSistema(){
    
        const sql = ` CREATE TABLE "LOG_SISTEMA"  
        (	"NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
        "DS_LOG" VARCHAR2(4000) 
        ) ; `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
                
            } else {
                console.log('Tabela LOG_SISTEMA criada com sucesso')
            }
        })
    }

    createContato(){
    
        const sql = `  CREATE TABLE "CONTATO"  

                (	"NR_SEQUENCIA" NUMBER GENERATED ALWAYS AS IDENTITY MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE ,  
            
            "DT_CONTATO" DATE, 
            "DT_RESPOSTA" DATE, 
            "DS_RESPOSTA" VARCHAR2(20), 
            "IE_FORMA_CONTATO" VARCHAR2(20),  
            "IE_AUTORIZADO" VARCHAR2(20),  
            "DS_CPF" VARCHAR2(256),  
            "DS_PROTOCOLO_WHATSAPP" VARCHAR2(50) 
                ) ;   `;

        this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }
                
            } else {
                console.log('Tabela CONTATO criada com sucesso')
            }
        })
    }

    createFunctions(){
        const sql = `create or replace  FUNCTION desc_contato 

       (ie_status_p in STATUS_coNTATO.ie_status%type)    
       RETURN VARCHAR     
       IS   
       ds_status_v varchar(50);   
       BEGIN 
           select ds_status     
           into ds_status_v     
           from STATUS_coNTATO 
           where ie_status = ie_status_p; 
       return ds_status_v; 
       END; 
       
       create or replace NONEDITIONABLE FUNCTION desc_governo 
       (ie_status_p in STATUS_governo.ie_status%type) 
       RETURN VARCHAR  
       IS  
       ds_status_v varchar(50); 
       
       BEGIN 
           select ds_status      
           into ds_status_v 
           from STATUS_governo 
           where ie_status = ie_status_p; 
       
       return ds_status_v; 
       END; 
    
       
       create or replace NONEDITIONABLE FUNCTION obter_status_governo 
       (ds_cpf_p in paciente.ds_cpf%type, 
       IE_AUTORIZADO_p in contato.IE_AUTORIZADO%type) 
       RETURN VARCHAR 
       
       IS 
       ie_status_envio_erro_v  varchar(1); 
       ie_status_envio_sucesso_v  varchar(1); 
       ie_status_envio_aguardando_v  varchar(1); 
       ie_status_envio_vazio_v  varchar(1);
       ds_status_v varchar(50); 

       BEGIN 
           select  max('S')  
           into ie_status_envio_erro_v 
           from paciente  
           where ds_cpf = ds_cpf_p 
           and ie_status_envio = 'E';
       
           select   max('S')  
           into ie_status_envio_sucesso_v 
           from paciente  
           where ds_cpf = ds_cpf_p 
           and ie_status_envio = 'T'; 
       
          select   max('S')  
           into ie_status_envio_aguardando_v 
           from paciente  
           where ds_cpf = ds_cpf_p 
           and (ie_status_envio = '' or ie_status_envio = 'A' or ie_status_envio is  null); 
           ds_status_v := '';
       
           IF (ie_status_envio_erro_v = 'S') THEN -- erro de envio 
       
               select ds_status 
               into ds_status_v 
               from status_governo 
               where ie_status = 'E'; 
       
           ELSIF (ie_status_envio_sucesso_v = 'S' AND ie_status_envio_aguardando_v = 'S') THEN --PARTE ENVIADO E PARTE AGUARDANDO 
       
               select ds_status 
               into ds_status_v 
               from status_governo 
               where ie_status = 'P'; 
       
           ELSIF (ie_status_envio_sucesso_v = 'S') THEN --TODOS ENVIADOS 
       
               select ds_status 
               into ds_status_v 
               from status_governo 
               where ie_status = 'T'; 
       
            ELSIF (ie_status_envio_aguardando_v = 'S' AND IE_AUTORIZADO_p = 'S') THEN --AUTORIZADO NO WHATS E AINDA NÃO ENVIADO 
               select ds_status 
               into ds_status_v 
               from status_governo 
               where ie_status = 'A'; 
       END IF; 
       
       return ds_status_v; 
       
       END; `;

       this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }     
            } else {
                console.log('Functions criadas com sucesso')
            }
        })
    }

    populate() {
        const sql = `REM INSERTING into STATUS_RESPOSTA 

        SET DEFINE OFF; 
        
        Insert into STATUS_RESPOSTA (NR_SEQUENCIA,IE_RESPOSTA,DS_RESPOSTA) values ('1','A','Autorizado'); 
        
        REM INSERTING into STATUS_GOVERNO 
        
        SET DEFINE OFF; 
        
        Insert into STATUS_GOVERNO (NR_SEQUENCIA,DS_STATUS,IE_STATUS) values ('1','Aguardando transmissão','A'); 
        
        Insert into STATUS_GOVERNO (NR_SEQUENCIA,DS_STATUS,IE_STATUS) values ('2','Transmitido','T'); 
        
        Insert into STATUS_GOVERNO (NR_SEQUENCIA,DS_STATUS,IE_STATUS) values ('3','Parcial','P'); 
        
        Insert into STATUS_GOVERNO (NR_SEQUENCIA,DS_STATUS,IE_STATUS) values ('4','Erro','E'); 
        
        REM INSERTING into STATUS_CONTATO 
        
        SET DEFINE OFF; 
        
        Insert into STATUS_CONTATO (NR_SEQUENCIA,IE_STATUS,DS_STATUS) values ('1','W','Enviado'); 
        
        Insert into STATUS_CONTATO (NR_SEQUENCIA,IE_STATUS,DS_STATUS) values ('2','A','Autorizado'); 
        
        Insert into STATUS_CONTATO (NR_SEQUENCIA,IE_STATUS,DS_STATUS) values ('3','N','Não autorizado'); 
        
        Insert into STATUS_CONTATO (NR_SEQUENCIA,IE_STATUS,DS_STATUS) values ('4','E','Autorizado email'); 
        
        Insert into STATUS_CONTATO (NR_SEQUENCIA,IE_STATUS,DS_STATUS) values ('21',null,'Não enviado'); `;
        

       this.connection.execute(sql,[], erro => {
            if(erro) {
                if(!erro.toString().includes('ORA-00955')){
                    console.log(erro)
                }     
            } else {
                console.log('Dados populados')
            }
        })
    }

}

export default new Tables;