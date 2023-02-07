import government from '../models/government'
import VerifyToken  from '../config/verifyTokenAdmin'
import { encrypt, decrypt } from '../utils/crypto'
import { cpfOnlyNumbers } from '../utils/cpfvalidator'
import RNDSApi from "../api/RNDSApi"
import jwt from 'jsonwebtoken';


export default function(app) {
  /***
   * Dispara solicitação de envio para o whatsapp do paciente
   */
    app.post('/government/sendRIAR', VerifyToken,  async function (req, res) {
      const token = req.headers['x-access-token'];
      jwt.verify(token, process.env.SECRET, async function(err, decoded) {
        if(decoded && decoded.id){

          var rndsApi = await conectToRNDS();
      
          let registers =  req.body.registers
          .map(p => {
                  p = cpfOnlyNumbers(p);
                  return encrypt(p)});

          government.getPatients(registers,
          list =>
            {
              list.forEach(async element => {

              //Controle para tentar reenviar pois a API do governo cai quando a massa de dados é grande
                var countSend = 0;
                var find500Error = false;
                do {
                    let response = await sendData(element, rndsApi, government, decoded.id);
                    find500Error = response.code == 500;
                    countSend++;
                    if(find500Error){
                      console
                      rndsApi = await conectToRNDS();
                    }
                } while(find500Error && countSend < 2);
              });


              
              //Gera um novo token no retorno pois a importação as vezes demora e aconexao cai
              const token = jwt.sign({ id: req.userId, level: req.userLevel}, process.env.SECRET, {expiresIn: 300 });// expires in 5min   
              res.set('Access-Control-Expose-Headers', 'x-acess-token')
              //novo token valido
              res.setHeader("x-acess-token", token);
              res.json({registers : ''});
              

            } //list
          );

        }
      });
    })

    const conectToRNDS = async () => {
      var rndsApi = await new RNDSApi().init();
      return rndsApi;
    }

    const sendData = async (element, rndsApi, government, id) => {
   
      element['DS_CPF'] = decrypt((element['DS_CPF']));
      var response =  await rndsApi.submitRIAR(
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

      let content = response.content;
      let idUnico = response.idUnico;
      response = response.response;

      let transmitido = "E";
      if(response.code == 201) {
        transmitido = 'T';
      }
      
      government.update([transmitido, 
          idUnico,
          encrypt(''), //  encrypt(content),
          encrypt(JSON.stringify(response)),
          id,
          element['NR_SEQUENCIA']
          ], data=>{});

      return response;
    }

    
    //Lista todos registros de um cpf
    app.get('/government/details/:cpf', VerifyToken,
    (req, res) => 
    {
      let cpfOnlyNumber = cpfOnlyNumbers(req.params.cpf);
      cpfOnlyNumber =encrypt(cpfOnlyNumber);

      government.loadStatus(cpfOnlyNumber, list =>{
          list.forEach(element => {
            element['DS_CONTEUDO_HL7'] = element['DS_CONTEUDO_HL7'] ?decrypt(element['DS_CONTEUDO_HL7']) : "",
            element['DS_RETORNO_GOVERNO'] = decrypt(element['DS_RETORNO_GOVERNO'])
          });
          res.json(list);
        });
    })

   // sendRIAR
}

