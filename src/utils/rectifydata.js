import modifydate from '../models/modifydate';
import { encrypt, decrypt } from '../utils/crypto';
import { validateCPF ,cpfOnlyNumbers, formatCPF } from '../utils/cpfvalidator';
import moment from 'moment';
import { RNDSApi } from "../api/RNDSApi";

const rectify = () => { 
    ckeckUpdate();
}

const ckeckUpdate = async () => {


    var rndsApi = await conectToRNDS();

    modifydate.getAllToUpdate( list =>{
   
        //Retifica no governo
        list.forEach(element => {
           if(element['DS_RETORNO_GOVERNO'] ) {
                console.log(JSON.parse(decrypt(element['DS_RETORNO_GOVERNO'] )).retorno);
                deleteData(JSON.parse(decrypt(element['DS_RETORNO_GOVERNO'] )).retorno,
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

const deleteData = async (headerlocation, element, rndsApi) => {
   
    element['DS_CPF'] = decrypt(element['DS_CPF']);
   
    //primeiro apaga o registro
    var response =  await rndsApi.deleteRIAR(headerlocation);
    let code = response.code;
   
    let ajustado = 'E';
    if(response.code == 204) {
        ajustado = 'A'; //Apagado da base do governo
    }

    console.log(response);
    response = response.retorno;

    modifydate.updateData([ajustado, 
            encrypt(JSON.stringify(response)),
            element['NR_SEQUENCIA'] ], data=>{});

    if(code == 204) {
        //envia o novo registro ao governo
        sendNewData(element, rndsApi);
    } else{
        console.log('Não enviado ao gov: '+code+" >> ", element);
    }
    return response;
  }



  const sendNewData = async (element, rndsApi) => {
   
  
    var response =  await rndsApi.submitRIAR(
      element['DS_CPF'],
      element['DS_IMUNOBIOLOGICO'] ,
      element['DT_ADMINISTRACAO'] , 
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
    var originalResponse = response;
    response = response.response;
    

    let transmitido = "E";
    if(response.code == 201) {
      transmitido = 'T';
    }


    console.log("Novo envio gov idUnico: ", idUnico);
    console.log("Novo envio gov rsponse: ", originalResponse);

    modifydate.updateNewData(
        [transmitido, 
        idUnico,
    //  encrypt(content),
        encrypt(''),
        encrypt(JSON.stringify(response)),
        element['NR_SEQUENCIA'] ], data=>{});

    return response;
  }


  const sendNewDataRec = async (element, rndsApi) => {
   
    var response =  await rndsApi.rectifyRIAR(
  	    element['ID_UNICO'],
      JSON.parse(decrypt(element['DS_RETORNO_GOVERNO'] )).retorno,
      element['DS_CPF'],
      element['DS_IMUNOBIOLOGICO'] ,
      element['DT_ADMINISTRACAO'] , 
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

	console.log("retorno do submit :: ");
	console.log(response);
    let content = response.content;
    let idUnico = response.idUnico;
    response = response.response;
    console.log('----');
    console.log(idUnico);
    console.log(response);

    let transmitido = "E";
    if(response.code == 201) {
      transmitido = 'T';

    modifydate.updateNewData([transmitido, 
        idUnico,
    //  encrypt(content),
        encrypt(''),
        encrypt(JSON.stringify(response)),
        element['NR_SEQUENCIA'] ], data=>{});
	} else{
		console.log('=======================Nada salvo em base para :',element);
	}
    return response;
  }



export {
    rectify
};
