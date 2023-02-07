import contact from '../models/contact';
import VerifyToken  from '../config/verifyTokenAdmin';
import WhatsApp from "../api/WhatsApp";
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';

export default function(app) {
  /***
   * Dispara solicitação de envio para o whatsapp do paciente
   */
    app.post('/contact/requestAutorizathion', VerifyToken,  async function (req, res) {

      let whatsApp =  new WhatsApp();
      await whatsApp.login();

      //da lista enviada, verifica os que tem permissão para enviar whats
      let data = await contact.loadContactToRequestAuthorization(req.body.registers);

      data.forEach(element => {

        let name = decrypt(element['NM_PACIENTE']);
        let firsName = name.split(" ")[0];
        let cpf = decrypt(element['DS_CPF']);
        let telefone = decrypt(element['DS_TELEFONE']);
        let birthdate = (element['DT_NASCIMENTO']);
        let rg = decrypt(element['DS_RG']);

        telefone = "47991276986";//TODO mudar quando produção
        //guarda o código de protocolo de cada envio
         whatsApp.sendRequest("55"+telefone, firsName, name, cpf, birthdate, rg )
          .then(protocol => {
            contact.updateSendWhatsAppRequest(protocol, element[1]);
          });
     
      });
     
    })

    //TODO - unificar tudo com request de cima, por cpf
    app.post('/contact/requestAutorizathionCPF', VerifyToken,  async function (req, res) {

      //encrypt first
      let registers =  req.body.registers
      .map(p => {
              p = cpfOnlyNumbers(p);
             return encrypt(p)});

      let whatsApp =  new WhatsApp();
      await whatsApp.login();

      //da lista enviada, verifica os que tem permissão para enviar whats
      let data = await contact.loadContactToRequestAuthorizationCPF(registers);

      data.forEach(element => {

        let name = decrypt(element['NM_PACIENTE']);
        let firsName = name.split(" ")[0];
        let cpf = decrypt(element['DS_CPF']);
        let telefone = decrypt(element['DS_TELEFONE']);
        let birthdate = (element['DT_NASCIMENTO']);
        let rg = decrypt(element['DS_RG']);

        telefone = "47991276986";//TODO mudar quando produção
        //guarda o código de protocolo de cada envio
         whatsApp.sendRequest("55"+telefone, firsName, name, cpf, birthdate, rg )
          .then(protocol => {
            contact.updateSendWhatsAppRequest(protocol, element[1], x=>{});
          });
      });  
    })
}

