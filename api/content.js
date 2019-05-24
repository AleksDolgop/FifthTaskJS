import db from '../pgBD';

//Запрашиваем с бд контент
exports.getContents = () => new Promise(async (resolve, reject) =>{
    try {
        //Запрашиваем отсортированные по id данные. с флагом show = true 
        resolve( await db.query('SELECT * FROM CONTENT WHERE show = true ORDER BY content_id ASC'));
    } 
    catch (err){
        reject(err);
    }
});

