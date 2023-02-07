import https from 'https';
import moment from "moment";
import FormData from 'form-data';

/**
 * 1 – Gerar token de acesso = user informado abaixo
 * 2 – Definir conta/número IDOR = 8
3 – Efetuar disparo/envio ativo
 */

class WhatsApp {
 
    constructor() {
        console.log('Initializing WhatsApp API');
        this.token = "";
    }

    defineAccount(token, resolve){

        const options = {
            hostname: 'api.plataformaomnichannel.com.br',
            path: `/v1/acesso/definirclienteoperacao/8`,
            method: 'PATCH',
            headers: {
                "Content-Type": 'application/json',
                "authorization": 'Token '+token,
            }
        }
        
        const req = https.request(options, res => {
        
            let data = '';
            res.setEncoding('utf8');
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('Body: ', JSON.parse(data));
                resolve();
            });
        
        }).on('error', e => {
            console.error(e);
        });
        
        req.write('');
        req.end();
    }

    async login(){
        var that = this;

        return new Promise((resolve, reject) => {
      
            const form  = new FormData();
            form.append("usuario", "api@idor.org");
            form.append("senha", "qYFF070f$lOl");

            var request = https.request({
                host: 'api.plataformaomnichannel.com.br',
                path: '/v1/acesso/criarsessao',
                method: 'POST',
                headers: form.getHeaders()
                },
                res => {
               // console.log(`statusCode: ${res.statusCode}`)
            
                var body = [];
                res.on('data', function(chunk) {
                    body.push(chunk);
                });

                res.on('end', function() {
                    try {
                        body = JSON.parse(Buffer.concat(body).toString());
                     //   console.log(body.data.token);
                        that.token = body.data.token;
                        that.defineAccount(that.token, resolve);
                    } catch(e) {
                        reject(e);
                    }
                });
                }
            );
            form.pipe(request);
        });
    }


    async sendRequest(telefone, firstName, completeName, cpf, birthdate, rg ){

        telefone = "0000";
        return new Promise((resolve, reject) => {


            const data = JSON.stringify({
                
                    "templateID": "d23fb103-e647-4fe7-8322-e5fbdb9a2a09",
                    "telefone": telefone,//"5547991276986",
                    "grupo": "IDOR",
                    "vip": true,
                    "agendamento": moment().format(), // "2021-10-20T13:16:17.210Z"
                    "variaveis": {
                    "mensagem": {
                        "additionalProp1": firstName,
                    },
                    "adicionais": {
                        "additionalProp1": completeName,
                        "additionalProp2": cpf,
                        "additionalProp3": birthdate,
                        "additionalProp4": rg
                    }
                    },
                    "tag": "ATIVO IDOR"
                
            })
            
            const options = {
                hostname: 'api.plataformaomnichannel.com.br',
                path: '/v1/ativo/envio/whatsapp',
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                "authorization": 'Token '+this.token,
                }
            }
            
            const req = https.request(options, res => {
            //    console.log(`statusCode: ${res.statusCode}`)
                var body = [];
                res.on('data', d => {
                    body.push(d);
                });

                res.on('end', function() {
                    try {
                        body = JSON.parse(Buffer.concat(body).toString());
                        resolve(body.data.protocol);
                    } catch(e) {
                        reject(e);
                    }
                });
            })
            
            req.on('error', error => {
                console.error(error)
            })
            
            req.write(data)
            req.end();

        });

    }

}

export default WhatsApp;