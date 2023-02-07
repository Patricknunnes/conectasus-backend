import VerifyToken  from '../config/verifyTokenAdmin';
import ExcelJS from 'exceljs';
import patient from '../models/patient'
import contact from '../models/contact'
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';
import cnsOnlyNumbers from '../utils/cnsutils';
import moment from 'moment'
import multer from 'multer';
import logsistema from '../models/logsistema'
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        // Extração da extensão do arquivo original:
        const extensaoArquivo = file.originalname.split('.')[1];

        // Cria um código randômico que será o nome do arquivo
        const novoNomeArquivo = crypto.randomBytes(64).toString('hex');

        // Indica o novo nome do arquivo:
        cb(null, `${novoNomeArquivo}.${extensaoArquivo}`)
    }
});
const upload = multer({ storage });

export default function(app) {

    app.post('/xlsx/upload', VerifyToken, upload.single('vacinas'), async function (req, res) {
        res.json({ file: req.file.filename });
        //buscar valores duplicados TODO TODO TODO
    })

    app.post('/xlsx/load', VerifyToken, async function (req, res) {

        const token = req.headers['x-access-token'];
        jwt.verify(token, process.env.SECRET, async function(err, decoded) {
          if(decoded && decoded.id){
            let createdRegister = await loadXLS(req.body.file, decoded.id);

            //Gera um novo token no retorno pois a importação as vezes demora e aconexao cai
            const token = jwt.sign({ id: req.userId, level: req.userLevel}, process.env.SECRET, {expiresIn: 300 });// expires in 5min   
            res.set('Access-Control-Expose-Headers', 'x-acess-token')
            //novo token valido
            res.setHeader("x-acess-token", token);
           //retorno da importação
            res.json({registers : createdRegister});
          }
        });

        
    })
}

function getDateIgnoreUTC  (value, logErro, cpf)  {

   
    if(typeof value == 'string'){
        value = moment(value, 'YYYY-MM-DD').toDate();
    }

    if(value=='Invalid Date'){
        logErro.push('Erro na data do cpf: '+cpf);
        console.log(error);
        return null;
    }

    try{
       return value.getUTCFullYear()
        + "-" +
        (value.getUTCMonth()+1).toString().padStart(2, "0")
        + "-" +
        value.getUTCDate().toString().padStart(2, "0");

    }catch(error ){
        logErro.push('Erro na data do cpf : '+cpf);
        console.log(error);
    }
    return null;
    

}

const loadXLS = async (file, loggerUser) => {

    let createdRegister = new Array(0);
    let errorOrDuplicated = new Array(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("uploads/"+file);
    const allLines =  new Array();
    workbook.eachSheet(function(worksheet, sheetId) {
      
        worksheet.eachRow({ includeEmpty: false }, async function(row, rowNumber) {
            if(rowNumber > 1){
                let cpfOnlyNumb = cpfOnlyNumbers(row.getCell(3).value.toString());

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
                    adminstration_date: getDateIgnoreUTC(row.getCell(11).value, errorOrDuplicated, cpfOnlyNumb),
                    immunobiological : row.getCell(12).value, 
                    manufacturer: row.getCell(13).value, 
                    batch: row.getCell(14).value, 
                    validate:  getDateIgnoreUTC(row.getCell(15).value, errorOrDuplicated, cpfOnlyNumb),// 15
                    dose : row.getCell(16).value.toString(), 
                    adminstration_route: row.getCell(17).value,
                    locale: row.getCell(18).value,
                    uf:  row.getCell(19).value, // uf 19
                    nr_user: loggerUser
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
            errorOrDuplicated.push('Paciente duplicado: '+decrypt(patientRow.cpf)+" Dose: "+patientRow.dose);
             logsistema.insert(moment().format()+" Registro duplicado: "+ patientRow.cpf+" - "+patientRow.dose);
        }

        const contactRow = { 
            ds_resposta :  null,
            dt_contato: null,
            dt_resposta: null,
            ie_autorizado: 'A', //Buscar do xls - temporariamenteo é A - até definir o whats
            ie_forma_contato: 'w',//Buscar do xls
            ds_cpf: patientRow.cpf
         };
    
        await contact.insertOrUpdate2(contactRow, data=>{});
      
    }

    return {createdRegister : createdRegister, duplicated: errorOrDuplicated};
}
