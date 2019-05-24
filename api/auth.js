import db from '../pgBD';
import errorTable from '../errorTable'
import md5 from 'js-md5';

//Сделаны проверки наличия определенных данных.
//Так же сделаны проверки на корректность данных.
//В случае если данные не прошли проверку вылетает ошибка 400 (Bad Request)

//аунтефикация по username, password
exports.login = ({username, password}) => new Promise(async (resolve, reject) =>{
    try {

        if (!username || !password){
            resolve({err: errorTable.errors['400']});
            return;
        }

        if (username.length < 3 || username.length > 20 || password.length < 6 || password.length > 20){
            resolve({err: errorTable.errors['400']});        
            return;
        }

        resolve(await db.query('SELECT true FROM users WHERE username = \'' + username + '\' AND password = \'' + md5(password) + '\''));
    } 
    catch (err){
        reject(err);
    }
});

//аунтефикация по session_id
exports.loginBySessionId = ({session_id}) => new Promise(async (resolve, reject) =>{
    try {

        if (!session_id){
            resolve({err: errorTable.errors['400']});
            return;
        }

        resolve(await db.query('SELECT user_id, username, admin FROM users WHERE session_id = \'' + session_id + '\''));
    } 
    catch (err){
        reject(err);
    }
});

//Установка session_id у пользователя
exports.setSessionId = (username, session_id) => new Promise(async (resolve, reject) =>{
    try {
        if (!session_id || !username){
            resolve({err: errorTable.errors['400']});
            return;
        }
        resolve(db.query('UPDATE users SET session_id = \''+ session_id +'\' WHERE username = \'' + username +'\''));
    } 
    catch (err){
        reject(err);
    }
});

//Удаление session_id у пользователя(выход из аккаунта)
exports.endSession = ({session_id}) => new Promise(async (resolve, reject) =>{
    try {
        if (!session_id){
            resolve({err: errorTable.errors['400']});
            return;
        }
        resolve(db.query('UPDATE users SET session_id = \'\' WHERE session_id = \'' + session_id +'\''));
    } 
    catch (err){
        reject(err);
    }
});
