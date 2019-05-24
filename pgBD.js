import PG from 'pg'

//Создаем объект pool и прописываем параментры для подключения к БД
const pool = new PG.Pool({
    user: 'ThoufthTaskBD',
    host: 'localhost',
    database: 'ThoufthTaskBD',
    password: 'ThoufthTaskBD',
    port: '5432',
});

//Экспорт модифицированного запроса с БД
//Которые выдает ограниченную (необходимую) инфу в ответе на запрос
exports.query = (text, params, callback) => new Promise (async (resolve, reject) =>{
    try{     
        //Для результата запроса
        let result;

        //Засекаем время
        const start = Date.now();

        //Если в параментрах указана функция callback
        if(callback)
        {        
            result = await pool.query(text, params, (err, res) =>{
                callback(err, res);
            });

        } else {
            result = await pool.query(text, params);
        }

        //Получаем время запроса в мсек
        const duration = Date.now() - start;

        //Записываем лог запроса в консоль (команда, время ответа, количество строк)
        console.log('Quary: ', { command: result.command, duration, rowsCount: result.rowCount });

        //Выводим только кол-во строк и массив полученных строк
        result = { res: {rowCount: result.rowCount, rows: result.rows}}
        
        resolve(result);
    }
    catch (err){
        reject({ err: err});
    }
});