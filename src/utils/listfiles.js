import fs from 'fs';
import ExcelJS from 'exceljs';
import modifydate from '../models/modifydate'
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';
import moment from 'moment'
import { RNDSApi } from "../api/RNDSApi";


const modifyDate = () => { 

    const testFolder = './uploads/';

    fs.readdir(testFolder, async (err, files) => {

        for(let x = 0; x < files.length; x++ ){
            await readXLSX(files[x]);
        }

     //   ckeckUpdate();
    });

}

async function  readXLSX(file){
    console.log(file);
    loadXLS(file);  
    
  
}


const readDateOld = (value) => {
    return moment(value, 'YYYY-MM-DD').toDate();
}

const readDateNew = (value) => {

    if(typeof value == 'string'){
        return readDateOld(value);
    }else{
        try{
            return new Date(value.getUTCFullYear(),value.getUTCMonth(), value.getUTCDate() );
        }catch(error ){
            console.log(error);
        }
        return null;
    }
    
                   
}


const loadXLS = async (file) => {

    let createdRegister = new Array(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("uploads/"+file);
    const allLines =  new Array();
    workbook.eachSheet(function(worksheet, sheetId) {
      
        worksheet.eachRow({ includeEmpty: false }, async function(row, rowNumber) {
            if(rowNumber > 1){
                let cpfAntigo = row.getCell(3).toString().split('.').join("").split('-').join("");
                cpfAntigo = cpfAntigo.padStart(11, "0");
                let cpfOnlyNumb = cpfOnlyNumbers(row.getCell(3).value.toString());


               let newAdminstrationDate = readDateNew(row.getCell(11).value);
               let newValidate =readDateNew(row.getCell(15).value);


                const patientRow = { 
                   
                    cpf_antigo: (encrypt(cpfAntigo)), 
                    cpf: (encrypt(cpfOnlyNumb)), 
                    dose : row.getCell(16).value.toString(),
                    adminstration_date: readDateOld(row.getCell(11).value),
                    new_adminstration_date : newAdminstrationDate,
                    validate:  readDateOld(row.getCell(15).value),// 15
                    new_validate :newValidate,
                    adminstration_date_str: 
                    ((""+newAdminstrationDate.getUTCDate()).padStart(2, "0")  )
                    +"/"+((""+(newAdminstrationDate.getUTCMonth()+1)).padStart(2, "0")  )
                    +"/"+newAdminstrationDate.getUTCFullYear(),
                    validate_str: 
                    ((""+newValidate.getUTCDate()).padStart(2, "0")  )+"/"
                    +((""+(newValidate.getUTCMonth()+1)).padStart(2, "0")  )
                    +"/"+newValidate.getUTCFullYear(),  
                    
                    

                    adminstration_date_str_2: 
                    newAdminstrationDate.getUTCFullYear()
                    +"-"+
                    ((""+(newAdminstrationDate.getUTCMonth()+1)).padStart(2, "0")  )
                    +"-"+
                    ((""+newAdminstrationDate.getUTCDate()).padStart(2, "0")  ),
                  

                    validate_str_2: 
                    newValidate.getUTCFullYear()
                    +"-"+
                    ((""+(newValidate.getUTCMonth()+1)).padStart(2, "0")  )
                    +"-"+
                    ((""+newValidate.getUTCDate()).padStart(2, "0")  ),  


                };
                allLines.push(patientRow);
            }
        });
    });


    for (const patientRow of allLines) {
       

        modifydate.getHowWasSendGov(patientRow, e=>{

            
            if(e.length > 0){

                
            let validate = 'N';
            let adm = 'N';

                e = e[0];
                console.log("-------");
                console.log("ne: "+e['NR_SEQUENCIA']);
                if(e['DT_ADMINISTRACAO'] != patientRow.adminstration_date_str_2){
                    console.log("ajustar adm "+e['DT_ADMINISTRACAO'] + " - "+patientRow.adminstration_date_str_2);
                    adm = 'S';
                }

                if(e['DT_VALIDADE'] != patientRow.validate_str_2){
                    console.log("ajustar validde "+ e['DT_VALIDADE'] +" - "+patientRow.validate_str_2);
                    validate = 'S';
                }

                try{
                modifydate.updateToWrongDates(
                    e['NR_SEQUENCIA'], adm, validate,
                patientRow.adminstration_date_str_2,
                patientRow.validate_str_2,
                 e=>{});
                }catch(e){
                    console.log(e);
                }
            }



        });

    /*    modifydate.count(patientRow, e=>{
            console.log("---------------------");
            console.log("*", patientRow);
            console.log(e);

            modifydate.updateToWrongValidate(patientRow, e=>{
            });
            modifydate.updateToWrongAdm(patientRow, e=>{
            });
    
            modifydate.updateToCorrect(patientRow, e=>{
            });


        });
        */
     
    }

   

    return createdRegister;
}

const ckeckUpdate = async () => {


    var rndsApi = await conectToRNDS();

    modifydate.getAllToUpdate( list =>{
   
        //Retifica no governo
        list.forEach(element => {
           if(element['DS_RETORNO_GOVERNO'] ) {
                console.log(JSON.parse(decrypt(element['DS_RETORNO_GOVERNO'] )).retorno);
                sendData(JSON.parse(decrypt(element['DS_RETORNO_GOVERNO'] )).retorno,
                element,
                rndsApi
                );
           }
          });
    });
}

const conectToRNDS = async () => {
    var rndsApi = await new RNDSApi().init();
    return rndsApi;
}

const sendData = async (headerlocation, element, rndsApi/*, government*/) => {
   
    element['DS_CPF'] = decrypt((element['DS_CPF']));
    var response =  await rndsApi.rectifyRIAR(
        headerlocation,
        element['DS_CPF'],
        element['DS_IMUNOBIOLOGICO'] ,
        element['DT_ADMINISTRACAO'] , //ver formato
        element['DS_FABRICANTE'] ,
        element['DS_LOTE'] ,
        element['DT_VALIDADE'] ,
        element['DS_LOCAL_APLICACAO'] ,
        element['IE_VIA_ADMINISTRACAO'] ,
        element['CD_CNS_PROFISSIONAL'] ,
        element['CD_ESTRATEGIA'] ,
        element['DS_PROTOCOLO_ANVISA']  ,     
        element['DS_PROTOCOLO_VERSAO']   ,       
        element['DS_REGISTRO_ANVISA'] ,
        element['NR_DOSE']);


        console.log(response);
        let content = response.content;
        response = response.response;

        let transmitido = "E";
        if(response.code == 201) {
        transmitido = 'T';
        }

   /* government.update([transmitido, 
    //  encrypt(content),
        encrypt(''),
        encrypt(JSON.stringify(response)),
        element['NR_SEQUENCIA'] ], data=>{});*/

       

    return response;
  }







































module.exports = {
    modifyDate
};
