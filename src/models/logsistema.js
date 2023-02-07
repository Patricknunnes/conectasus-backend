import connection from '../database/connection';;

class LogSistema { 
    insert(log) {
        const sql = 'INSERT INTO log_sistema(ds_log) VALUES (:ds_log)';
        let values =  [log];
        connection.then( conn => { 
            let result =  conn.execute(sql, values,{ autoCommit: true }); 
         });
    }
    insertLogAcesso(user) {
        const sql = 'insert into log_acesso(nm_usuario, dt_acesso) values (:nm_usuario, sysdate)';
        let values =  [user];
        connection.then( conn => { 
            let result =  conn.execute(sql, values,{ autoCommit: true }); 
         });
    }
}

export default new LogSistema;