import db from '../pgBD';

//Запрашиваем с бд меню
exports.getMenu = () => new Promise(async (resolve, reject) =>{
    try {
        //Запрашиваем отсортированные по id данные. с флагом show = true
        resolve( await db.query('SELECT * FROM MENU WHERE show = true ORDER BY menu_id ASC'));
    } 
    catch (err){
        reject(err);
    }
});