import oracledb from 'oracledb';

import  * as dotenv from "dotenv-safe";
dotenv.config();

const connection =  oracledb.getConnection(
    { user: process.env.REACT_APP_DATA_BASE_USER,
    password: process.env.REACT_APP_DATA_BASE_PASSWORD,
    connectionString: process.env.REACT_APP_DATA_BASE_URL });
    
console.log("Successfully connected to Oracle Database");

export default connection;
//https://www.oracle.com/database/technologies/appdev/quickstartnodeonprem.html
