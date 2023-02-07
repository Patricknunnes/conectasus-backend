import  * as dotenv from "dotenv-safe";
dotenv.config();
import jwt from 'jsonwebtoken';
import md5 from 'md5'
import User from '../models/user'
import logsistema from '../models/logsistema'

export default function(app) {
    app.post('/login', async function (req, res, next)  {
        const usuario = await User.getByLogin(req.body.login, async function(data){
            try {
                verificaUsuario(data);
                await verificaSenha(req.body.password, data[2]);
                const id  = data[0];
                const token = jwt.sign({ id:id, level: data[4] }, process.env.SECRET, {expiresIn: 300 });// expires in 5min    
                logsistema.insertLogAcesso(req.body.login);
                return res.json({ auth: true, 
                                accessToken: token, 
                                nm_pessoa: data[3],
                                state: process.env.RNDS_REQUISITANTE_UF});

            } catch (error) {
              return res.json({ auth: false,  message: error.message });
            }
        });
    })

    app.post('/logout', function(req, res) {
        res.json({ auth: false, accessToken: null });
        //TODO : create a blacklist
    })

    function verificaUsuario(usuario) {
        if (!usuario) {
          throw new Error('Login ou senha inválido');
        }
      }
      
      async function verificaSenha(senha, senhaHash) {
        const senhaValida = md5(senha) == senhaHash;
        if (!senhaValida) {
          throw new Error('Login ou senha inválido');
        }
      }
 
}