import { v4 } from 'uuid';
import moment from "moment";
import RNDS from "rnds";
//https://www.npmjs.com/package/rnds?activeTab=explore
//https://kyriosdata.github.io/rnds/docs/rnds/tools/bibliotecas

class RNDSApi {
    
    client = null;
    
    constructor() {
        console.log('Initializing RNDS API');
    }
    
    getClient = () => this.client;
    
    init = async () => {
        if (this.client == null) {
            this.client = await RNDS.cliente(true, true, true);
        }
        return {
            submitRIAR : this.submitRIAR,
            rectifyRIAR: this.rectifyRIAR,
            deleteRIAR: this.deleteRIAR
        }
    }
    

    submitRIAR = async (
       cpfCnsPaciente ,
       codVacina ,
       dataDaAplicacaoVacinaPaciente ,
       labFabricante ,
       loteVacina ,
       validadeVacina ,
       localAplicacao,
       viaAplicacao ,
       cnsProfissional,
       estrategiaVacina ,
       anvisaProtocolo ,
       anvisaVersao ,
       anvisaRegistro ,
       doseAdministrada ,

    ) => {
      const client = await this.getClient();    
      const idUnicoNaOrigem = v4();
      const currentDate = moment().format();
      const identificadorSolicitanteBA  =process.env.BUNDLE_SOLICITANTE;
      const cnesBA =process.env.BUNDLE_CNES;
      const fhirDocument = `
        {
            "resourceType": "Bundle",
            "meta": {
              "lastUpdated": "2021-09-06T14:59:51.283-03:00"
            },
            "identifier": {
              "system": "http://www.saude.gov.br/fhir/r4/NamingSystem/BRRNDS-${identificadorSolicitanteBA}",
              "value": "${idUnicoNaOrigem}"
            },
            "type": "document",
            "timestamp": "${currentDate}",
            "entry": [
              {
                "fullUrl": "urn:uuid:transient-0",
                "resource": {
                  "resourceType": "Composition",
                  "meta": {
                    "profile": [
                      "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRegistroImunobiologicoAdministradoRotina-1.0"
                    ]
                  },
                  "status": "final",
                  "type": {
                    "coding": [
                      {
                        "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento",
                        "code": "RIA"
                      }
                    ]
                  },
                  "subject": {
                    "identifier": {
                      "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0",
                      "value": "${cpfCnsPaciente}"
                    }
                  },
                  "date": "${currentDate}",
                  "author": [
                    {
                      "identifier": {
                        "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstabelecimentoSaude-1.0",
                        "value": "${cnesBA}"
                      }
                    }
                  ],
                  "title": "Registro de Imunobiologico Administrado na Rotina",
                  "section": [
                    {
                      "entry": [
                        {
                          "reference": "urn:uuid:transient-1"
                        }
                      ]
                    }
                  ]
                }
              },
              {
                "fullUrl": "urn:uuid:transient-1",
                "resource": {
                  "resourceType": "Immunization",
                  "meta": {
                    "profile": [
                      "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRImunobiologicoAdministrado-2.0"
                    ]
                  },
                  "status": "completed",
                  "vaccineCode": {
                    "coding": [
                      {
                        "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRImunobiologico",
                        "code": "${codVacina}"	
                      }
                    ]
                  },
                  "patient": {
                    "identifier": {
                      "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0",
                      "value": "${cpfCnsPaciente}"					
                    }
                  },
                  "occurrenceDateTime": "${dataDaAplicacaoVacinaPaciente}",
                  "manufacturer": {
                    "identifier": {
                      "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRFabricantePNI",
                      "value": "${labFabricante}"	
                    }
                  },
                  "lotNumber": "${loteVacina}",	
                  "expirationDate": "${validadeVacina}",
                  "site": {
                    "coding": [
                      {
                        "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRLocalAplicacao",
                        "code": "${localAplicacao}"
                      }
                    ]
                  },
                  "route": {
                    "coding": [
                      {
                        "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRViaAdministracao",
                        "code": "${viaAplicacao}"	
                      }
                    ]
                  },
                  "performer": [
                    {
                      "actor": {
                        "reference": "Practitioner/${cnsProfissional}"
                      }
                    }
                  ],
                  "protocolApplied": [
                    {
                      "extension": [
                        {
                          "url": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstrategiaVacinacao-1.0",
                          "valueCodeableConcept": {
                            "coding": [
                              {
                                "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BREstrategiaVacinacao",
                                "code": "${estrategiaVacina}"
                              }
                            ]
                          }
                        },
                        {
                          "url": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstrategiaVacinacaoPesquisa-1.0",
                          "extension": [
                            {
                              "url": "numeroProtocoloEstudoANVISA",
                              "valueString": "${anvisaProtocolo}"
                            },
                            {
                              "url": "numeroVersaoProtocoloEstudo",
                              "valueString": "${anvisaVersao}"
                            },
                            {
                              "url": "numeroRegistroVacinaAnvisa",
                              "valueString": "${anvisaRegistro}"
                            }
                          ]
                        }
                      ],
                      "doseNumberString": "${doseAdministrada}"	
                    }
                  ]
                }
              }
            ]
          }                    
        `
        //Governo não suporta tantas requisições
        try{
          const response = await client.notificar(fhirDocument);
          return {response: response,
            content: fhirDocument,
            idUnico: idUnicoNaOrigem
          };
        } catch (eeror){
          console.log(eeror);
        }
        return null; 
    }  
    
    rectifyRIAR = async (
      idUnicoNaOrigem,
      headerLocation,
      cpfCnsPaciente ,
      codVacina ,
      dataDaAplicacaoVacinaPaciente ,
      labFabricante ,
      loteVacina ,
      validadeVacina ,
      localAplicacao,
      viaAplicacao ,
      cnsProfissional,
      estrategiaVacina ,
      anvisaProtocolo ,
      anvisaVersao ,
      anvisaRegistro ,
      doseAdministrada ,

   ) => {
     const client = await this.getClient();   
     const currentDate = moment().format();
     const identificadorSolicitanteBA  =process.env.BUNDLE_SOLICITANTE;
     const cnesBA =process.env.BUNDLE_CNES;
     const fhirDocument = `
       {
           "resourceType": "Bundle",
           "meta": {
             "lastUpdated": "2021-09-06T14:59:51.283-03:00"
           },
           "identifier": {
             "system": "http://www.saude.gov.br/fhir/r4/NamingSystem/BRRNDS-${identificadorSolicitanteBA}",
             "value": "${idUnicoNaOrigem}"
           },
           "type": "document",
           "timestamp": "${currentDate}",
           "entry": [
             {
               "fullUrl": "urn:uuid:transient-0",
               "resource": {
                 "resourceType": "Composition",
                 "meta": {
                   "profile": [
                     "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRRegistroImunobiologicoAdministradoRotina-1.0"
                   ]
                 },
                 "status": "final",
                 "type": {
                   "coding": [
                     {
                       "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRTipoDocumento",
                       "code": "RIA"
                     }
                   ]
                 },
                 "subject": {
                   "identifier": {
                     "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0",
                     "value": "${cpfCnsPaciente}"
                   }
                 },
                 "date": "${currentDate}",
                 "author": [
                   {
                     "identifier": {
                       "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstabelecimentoSaude-1.0",
                       "value": "${cnesBA}"
                     }
                   }
                 ],
                 "title": "Registro de Imunobiologico Administrado na Rotina",
                 "relatesTo": [
                  {
                      "code": "replaces",
                      "targetReference": {
                          "reference": "Composition/${headerLocation}"
                      }
                  }
                  ],
                 "section": [
                   {
                     "entry": [
                       {
                         "reference": "urn:uuid:transient-1"
                       }
                     ]
                   }
                 ]
               }
             },
             {
               "fullUrl": "urn:uuid:transient-1",
               "resource": {
                 "resourceType": "Immunization",
                 "meta": {
                   "profile": [
                     "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRImunobiologicoAdministrado-2.0"
                   ]
                 },
                 "status": "completed",
                 "vaccineCode": {
                   "coding": [
                     {
                       "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRImunobiologico",
                       "code": "${codVacina}"	
                     }
                   ]
                 },
                 "patient": {
                   "identifier": {
                     "system": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BRIndividuo-1.0",
                     "value": "${cpfCnsPaciente}"					
                   }
                 },
                 "occurrenceDateTime": "${dataDaAplicacaoVacinaPaciente}",
                 "manufacturer": {
                   "identifier": {
                     "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRFabricantePNI",
                     "value": "${labFabricante}"	
                   }
                 },
                 "lotNumber": "${loteVacina}",	
                 "expirationDate": "${validadeVacina}",
                 "site": {
                   "coding": [
                     {
                       "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRLocalAplicacao",
                       "code": "${localAplicacao}"
                     }
                   ]
                 },
                 "route": {
                   "coding": [
                     {
                       "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BRViaAdministracao",
                       "code": "${viaAplicacao}"	
                     }
                   ]
                 },
                 "performer": [
                   {
                     "actor": {
                       "reference": "Practitioner/${cnsProfissional}"
                     }
                   }
                 ],
                 "protocolApplied": [
                   {
                     "extension": [
                       {
                         "url": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstrategiaVacinacao-1.0",
                         "valueCodeableConcept": {
                           "coding": [
                             {
                               "system": "http://www.saude.gov.br/fhir/r4/CodeSystem/BREstrategiaVacinacao",
                               "code": "${estrategiaVacina}"
                             }
                           ]
                         }
                       },
                       {
                         "url": "http://www.saude.gov.br/fhir/r4/StructureDefinition/BREstrategiaVacinacaoPesquisa-1.0",
                         "extension": [
                           {
                             "url": "numeroProtocoloEstudoANVISA",
                             "valueString": "${anvisaProtocolo}"
                           },
                           {
                             "url": "numeroVersaoProtocoloEstudo",
                             "valueString": "${anvisaVersao}"
                           },
                           {
                             "url": "numeroRegistroVacinaAnvisa",
                             "valueString": "${anvisaRegistro}"
                           }
                         ]
                       }
                     ],
                     "doseNumberString": "${doseAdministrada}"	
                   }
                 ]
               }
             }
           ]
         }                    
       `;

       console.log("------------------");
       console.log("FhirGov: "+fhirDocument);
       //Governo não suporta tantas requisições
       try{
         const response = await client.substituir(fhirDocument);
         console.log("resposta: ",response);
         return {response: response,
           content: fhirDocument,
           idUnico: idUnicoNaOrigem};
       } catch (eeror){
         console.log(eeror);
       }
       return null; 
   }  
   
   

   deleteRIAR = async (headerLocation) => {
    const client = await this.getClient();    
    
    function extraiRndsId(resposta) {
      if (resposta.code !== 201) {
        return resposta;
      }

      const location = resposta.headers["location"];
      const rndsId = location.substring(location.lastIndexOf("/") + 1);
      resposta.retorno = rndsId;
      return resposta;
    }

    const options = {
      method: "DELETE",
      path: "/api/fhir/r4/Bundle/"+headerLocation,
    };

    return client.makeRequest(options, null).then(extraiRndsId);





  }  
}

export default RNDSApi;
