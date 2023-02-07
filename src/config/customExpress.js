import express from 'express';
import cors from 'cors';
import contact from '../controllers/contact';
import correctdate from '../controllers/correctdate';
import government from '../controllers/government';
import login from '../controllers/login';
import patients from '../controllers/patients';
import whatsapp from '../controllers/whatsapp';
import xls from '../controllers/xls';

export default function(consign) {
  const app = express()
  app.use(express.json()) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cors({  origin: '*'}));
  
  // consign({cwd: 'src'})
  //   .include('controllers')
  //   .into(app)
  
  contact(app);
  correctdate(app);
  government(app);
  login(app);
  patients(app);
  whatsapp(app);
  xls(app);
  
  return app
}