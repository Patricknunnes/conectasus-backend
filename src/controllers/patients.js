import patient from '../models/patient';
import VerifyToken  from '../config/verifyTokenAdmin';
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';
import jwt from 'jsonwebtoken';

const ITENS_PER_PAGE = 150;

export default function(app) {
  /**
   * Retorna a quantidade de registros exisstente em base de dados
   * DE acordo com os parametros de filtro passados
   */
    app.get('/patients/size', VerifyToken,
    (req, res) => 
    {
        patient.countQuery( qtReg =>{
          res.json({qt_registros: qtReg});
        });
    })

    app.get('/patients/sizedata', VerifyToken,
    (req, res) => 
    {

      if(req.query && req.query.name){
        req.query.name = encrypt(cpfOnlyNumbers(req.query.name));
      }

        patient.countQuery(req.query,
          qtReg =>{
          
          patient.listSinglePatientByPage(1,ITENS_PER_PAGE, req.query, list =>{
            list.forEach(element => {
              element['NM_PACIENTE'] = decrypt((element['NM_PACIENTE']));
              element['DS_CPF'] = formatCPF(decrypt((element['DS_CPF'])));
            });
            res.json({qt_registros: qtReg, registers: list});
          });

        });
    })

    /**
     * 
     */
    app.get('/patients/:page', VerifyToken,
    (req, res) => 
    {
        patient.listSinglePatientByPage(req.params.page,ITENS_PER_PAGE,  req.query, list =>{
          list.forEach(element => {
            element['NM_PACIENTE'] = decrypt((element['NM_PACIENTE']));
            element['DS_CPF'] = formatCPF(decrypt((element['DS_CPF'])));
          });
          res.json(list);
        });
    })

    //Lista todos registros de um cpf
    app.get('/patients/details/:cpf', VerifyToken,
    (req, res) => 
    {
        patient.getByCPF(encrypt(cpfOnlyNumbers(req.params.cpf)), list =>{
          list.forEach(element => {
            element['CHAVE'] = element['DS_CPF']; 
            element['NM_PACIENTE'] = decrypt(element['NM_PACIENTE']);
            element['DS_CPF'] = formatCPF(decrypt(element['DS_CPF']));
            element['DS_TELEFONE'] = decrypt((element['DS_TELEFONE']));
          });
          res.json(list);
        });
    })

    //Edita um registro especifico
    app.patch('/patients/edit', VerifyToken, async (req, res) => 
    {
      
      const token = req.headers['x-access-token'];
      jwt.verify(token, process.env.SECRET, async function(err, decoded) {
        if(decoded && decoded.id){

          var msgErro = undefined;
          for(let i =0; i < req.body.data.length; i++){
            var element =  req.body.data[i];
            element['NM_PACIENTE'] = encrypt(element['NM_PACIENTE']);
            element['DS_CPF'] = encrypt(cpfOnlyNumbers(element['DS_CPF']));
            element['DS_TELEFONE'] = encrypt(element['DS_TELEFONE']);
            element['NR_USUARIO_EDICAO'] = decoded.id;

            try {
              await patient.updateContato(element, e=>{ },  error => {});
              
              await patient.update(element, e=>{ },  error => {});
              
            }
            catch (rejectedValue) {
              msgErro = rejectedValue;
            }
          }

          if(msgErro){
            res.json({status: 'ERROR', message: msgErro});
          }else{
            res.json({status: 'OK'});
          }
        }
      });

      
    });
}
