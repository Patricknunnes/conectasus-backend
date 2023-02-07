import fs from 'fs'
import VerifyToken  from '../config/verifyTokenAdmin'
import ExcelJS from 'exceljs'
import patient from '../models/patient'
import contact from '../models/contact'
import { encrypt, decrypt } from '../utils/crypto'
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator'
import cnsOnlyNumbers from '../utils/cnsutils'
import moment from 'moment'
import logsistema from '../models/logsistema'

export default function(app) {

 

    app.post('/rectify/date', VerifyToken, async function (req, res) {

        const testFolder = './uploads/';

        fs.readdir(testFolder, (err, files) => {
            files.forEach(file => {
                console.log(file);
            });
        });

        let createdRegister = await loadXLS(req.body.file);
        res.json({registers : createdRegister});
    })
}

const loadXLS = async (file) => {

    let createdRegister = new Array(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("uploads/"+file);
    const allLines =  new Array();
    workbook.eachSheet(function(worksheet, sheetId) {
      
        worksheet.eachRow({ includeEmpty: false }, async function(row, rowNumber) {
            if(rowNumber > 1){
                let cpfOnlyNumb = cpfOnlyNumbers(row.getCell(3).value.toString());
                cpfOnlyNumb = cpfOnlyNumb.padStart(11, "0");

                let cnesOnlyNumbers =  row.getCell(5).value;
                cnesOnlyNumbers =  cnesOnlyNumbers ? cnsOnlyNumbers(cnesOnlyNumbers.toString()).padStart(7, "0") : '';
              
                let profCnsOnlyNumbers =  cnsOnlyNumbers(row.getCell(6).value.toString()).padStart(15, "0");
               
               let phon = row.getCell(4).value;
               phon = phon ? phon.toString() : '';

                //todo todo todp
                const patientRow = { 
                    name: (encrypt(row.getCell(1).value)),  
                    id: row.getCell(2).value, //não salva em banco
                    cpf: (encrypt(cpfOnlyNumb)), 
                    phone: (encrypt(phon)), 
                    cnes : (encrypt(cnesOnlyNumbers)),  
                    prof_cns: profCnsOnlyNumbers,
                    anvisa_protocol: row.getCell(7).value,
                    anvisa_protocol_version : row.getCell(8).value,
                    strategy :  row.getCell(9).value,//estrategia 9
                    anvisa_number: row.getCell(10).value, 
                    adminstration_date: moment(row.getCell(11).value, 'YYYY-MM-DD').toDate(),
                   new_adminstration_date :
                   new Date(row.getCell(11).value.getUTCFullYear(),row.getCell(11).value.getUTCMonth(), row.getCell(11).value.getUTCDate() ),
                    immunobiological : row.getCell(12).value, 
                    manufacturer: row.getCell(13).value, 
                    batch: row.getCell(14).value, 
                    validate:  moment(row.getCell(15).value, 'YYYY-MM-DD').toDate(),// 15
                    new_validate :
                    new Date(row.getCell(15).value.getUTCFullYear(),row.getCell(15).value.getUTCMonth(), row.getCell(15).value.getUTCDate() ),
                   
                    dose : row.getCell(16).value.toString(), 
                    adminstration_route: row.getCell(17).value,
                    locale: row.getCell(18).value,
                    uf:  row.getCell(19).value, // uf 19
                    nr_user: 0 
                 };
                 allLines.push(patientRow);
            }
        });
    });


    for (const patientRow of allLines) {
       let data= await patient.insert2(patientRow);
        if(data > 0){
            createdRegister.push(data);
        }else{
             logsistema.insert(moment().format()+" Registro duplicado: "+ patientRow.cpf+" - "+patientRow.dose);
        }

        const contactRow = { 
            ds_resposta :  null,
            dt_contato: null,
            dt_resposta: null,
            ie_autorizado: null, //Buscar do xls
            ie_forma_contato: 'w',//Buscar do xls
            ds_cpf: patientRow.cpf
         };
    
        await contact.insertOrUpdate2(contactRow, data=>{});
      
    }

    return createdRegister;
}



  //https://consolelog.com.br/upload-de-arquivos-imagens-utilizando-multer-express-nodejs/
    //https://stackoverflow.com/questions/34328846/node-multer-get-filename


//https://www.ti-enxame.com/pt/node.js/node-arquivo-de-leitura-exceljs/1051013536/