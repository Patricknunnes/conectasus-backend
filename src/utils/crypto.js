import crypto from 'crypto';
const algorithm = process.env.REACT_APP_CRYPTO_ALGORITHM;
const secretKey = process.env.REACT_APP_CRYPTO_SECRET_KEY;

const iv = Buffer.from( [13, 239, 7, 131, 60, 127, 22, 158, 223, 243, 203, 177, 135, 47, 67, 180]);

const encrypt = (text) => {
    if(!text){
        return null;
    }
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
   return encrypted.toString('hex');
};

const decrypt = (content) => {
    if(!content){
        return null;
    }
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(content, 'hex')), decipher.final()]);
    return decrpyted.toString();
};

export {
    encrypt,
    decrypt
};

//https://attacomsian.com/blog/nodejs-encrypt-decrypt-data