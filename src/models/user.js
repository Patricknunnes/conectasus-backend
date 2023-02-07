import connection from '../database/connection';

class User {

    insert(user){
        let sql = ``;
        let values =  [];
        connection.then( conn => { 
            let result =  conn.execute(sql, values,{ autoCommit: true }); 
         });
    }

    async getByLogin(user, callBack){
        connection.then( async function(conn ){ 
            let sql = `SELECT * FROM usuario WHERE nm_usuario = :nm_usuario`;
            let result =  await conn.execute(sql, [user],{ autoCommit: true }); 
            callBack(result && result.rows ? result.rows[0] : null);
         });
    }

}

export default new User;