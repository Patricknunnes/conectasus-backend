import  * as dotenv from "dotenv-safe";
dotenv.config();
import jwt from 'jsonwebtoken';

export default function (req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token){
      return res.status(401).json({ auth: false, message: 'No token provided.' });
    } 
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err){
        return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
      }
      
      if(!decoded || !(decoded.level === 'admin')){
        return res.status(403).json({ auth: false, message: 'No admin user.' });
      }
      // se tudo estiver ok, salva no request para uso posterior
      let id = decoded.id;
      let level = decoded.level;
      req.userId = id;
      req.userLevel = decoded.level;
      const token = jwt.sign({ id: id, level: level}, process.env.SECRET, {expiresIn: 300 });// expires in 5min   
      res.set('Access-Control-Expose-Headers', 'x-acess-token')
      //novo token valido
      res.setHeader("x-acess-token", token);

      next();
    });
}