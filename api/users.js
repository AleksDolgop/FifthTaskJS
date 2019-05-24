import db from '../pgBD';
import errorTable from '../errorTable'
import md5 from 'js-md5';

//Сделаны проверки наличия определенных данных.
//Так же сделаны проверки на корректность данных.
//В случае если данные не прошли проверку вылетает ошибка 400 (Bad Request)

//Получаем список пользователей.
exports.getUsersList = () => new Promise(async (resolve, reject) =>{
    try {
        //Запрашиваем список пользователей, сортируем по username
        resolve( await db.query('SELECT user_id, username FROM users ORDER BY username ASC'));
    } 
    catch (err){
        reject(err);
    }
});

//Получаем пользователя по user_id
exports.getUserById = (user_id) => new Promise(async (resolve, reject) =>{
    try {
        resolve( await db.query('SELECT user_id, username, admin FROM users WHERE user_id = ' + user_id));
    } 
    catch (err){
        reject(err);
    }
});

//Получаем пользователя по username
exports.getUserByName = ({username}) => new Promise(async (resolve, reject) =>{
    try {
        if(!username){
            resolve({err: errorTable.errors['400']});
            return;
        }

        if(username.length < 3 || username.length > 20){
            resolve({err: errorTable.errors['400']});
            return;
        }

        resolve( await db.query('SELECT user_id, username, admin FROM users WHERE username = \'' + username + '\''));      
    } 
    catch (err){
        reject(err);
    }
});

//Создание нового пользователя
exports.createUser = ({username, password}) => new Promise(async (resolve, reject) =>{
    try {
        if (!username || !password){
            resolve({err: errorTable.errors['400']});
            return;
        }

        if (username.length < 3 || username.length > 20 || password.length < 6 || password.length > 20){
            resolve({err: errorTable.errors['400']});      
            return;
        }
        //Создаем новую запись. флаг админ ставим в false, т.к. он не может быть равен null
        resolve( await db.query('INSERT INTO users (username, password, admin) VALUES (\'' + username + '\',\'' + md5(password) + '\', false)'));      
    } 
    catch (err){
        reject(err);
    }
});

//Обновление пароля у юзера
exports.updateUserPassword = ({username, password, oldPassword, session_id}) => new Promise(async (resolve, reject) =>{
    try {
        if (!username || !password || !oldPassword || !session_id){
            resolve({err: errorTable.errors['400']});         
            return;
        }

        if (username.length < 3 || username.length > 20 || password.length < 6 || password.length > 20 || oldPassword.length < 6 || oldPassword.length > 20){
            resolve({err: errorTable.errors['400']});
            return;
        }

        resolve( await db.query(
            'UPDATE users SET password = \'' + md5(password) +
            '\' WHERE username = \'' + username +
            '\' AND password = \'' + md5(oldPassword) + 
            '\' AND session_id = \'' + session_id + 
            '\''));
    } 
    catch (err){
        reject(err);
    }
});

//Удаляем пользователя
exports.deleteUser = ({username, password, session_id}) => new Promise(async (resolve, reject) =>{
    try {       
        if (!username || !password || !session_id){
            resolve({err: errorTable.errors['400']});
            return;
        }

        if (username.length < 3 || username.length > 20 || password.length < 6 || password.length > 20){
            resolve({err: errorTable.errors['400']});      
            return;
        }

        resolve(await db.query('DELETE FROM users WHERE username = \'' + username +
        '\' AND password = \'' + md5(password) + 
        '\' AND session_id = \'' + session_id + 
        '\''));
    } 
    catch (err){
        reject(err);
    }
});

//Выход пользователя (очищается session_id)
exports.logOutUser = ({session_id}) => new Promise(async (resolve, reject) =>{
    try {
        if (!session_id){
            resolve({err: errorTable.errors['400']});
            return;     
        }

        resolve(await db.query('UPDATE users SET session_id = \'\' WHERE session_id =\''+ session_id +'\''));
    } catch (err){
        reject(err);
    }
});