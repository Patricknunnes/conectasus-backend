
import contact from '../models/contact';
import verifyTokenWhatsApp  from '../config/verifyTokenWhatsApp';
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';
import moment from "moment";

export default function(app) {
  /***
   * Recebe a resposta do whatsapp do cliente
   */
    app.post('/whatsapp/responseAutorizathion', verifyTokenWhatsApp,  async function (req, res) {

      try{
          if(req.body.registers){
            for (const element of  req.body.registers) {
              element.date = moment(element.date).toDate();
              element.cpf = encrypt(cpfOnlyNumbers(element.cpf));
              element.response = element.response === 'S' ? 'A' : element.response;
              await contact.updateResposeWhatsApp(element.cpf, element.response, element.date );
        }
          res.json("OK");
        }else{
          res.json("No data found");
        }
      }
        catch (rejectedValue) {
          res.status(500);
      }
    })
   // sendRIAR
}

