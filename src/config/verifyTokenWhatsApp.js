import  * as dotenv from "dotenv-safe";
dotenv.config();
import jwt from 'jsonwebtoken';

export default function(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token){
      return res.status(401).json({ auth: false, message: 'No token provided.' });
    } 
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err){
        return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
      }
      
      if(!decoded || !(decoded.level === 'whatsapp')){
        return res.status(403).json({ auth: false, message: 'No admin user.' });
      }
      next();
    });
}