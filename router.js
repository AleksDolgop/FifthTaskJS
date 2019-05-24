import Router from 'koa-router';
const router = new Router();

//Наши апи модули
import content from './api/content';
import menu from './api/menu';
import auth from './api/auth';
import users from './api/users'

//Хэширование md5
import md5 from 'js-md5';

//Импортируем таблицу ошибок
import errorTable from './errorTable';

//router
router
    //Главная страница
    .get('/', (ctx) =>{
        ctx.body = 'Server API: localhost:3000';
    })
    //Контент
    .get('/content', async (ctx) =>{
        try{
            //Делаем запрос к бд и ответ записываем
            const result = await content.getContents();

            //Если ловим ошибку с бд, отправляем в catch.
            if (result.err) throw 'DB err';

            ctx.status = 200;
            ctx.body = {
                sucess: true,
                data: { content: result.res.rows}
            };      
            
        }
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Меню
    .get('/menu', async (ctx) =>{
        try{
            const result = await menu.getMenu();

            //Если ловим ошибку с бд, отправляем в catch.
            if (result.err) throw 'DB err';

            ctx.status = 200;
            ctx.body = {
                sucess: true,
                data: { nav: result.res.rows}
            }; 
        }
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Все пользователи
    .get('/users', async (ctx) =>{
        try {
            //загружаем с бд список пользователей (user_id, username)
            let result = await users.getUsersList();          

            //Если ловим ошибку с бд, отправляем в catch.
            if (result.err) throw 'DB err';

            ctx.status = 200;
            ctx.body = {
                sucess: true,
                data: { users: result.res.rows}
            }; 
        } 
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Обращаемся к конкретному пользователю. 
    //user - user_id OR username
    .get('/users/:user', async (ctx)=>{
        try {
            let result;
            
            //Есть возможность обратиться к пользователю по id и по username
            if (isNaN(ctx.params.user))
            {
                result = await users.getUserByName({username: ctx.params.user}); 
            } else {
                result = await users.getUserById(ctx.params.user); 
            }
            
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if(result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                    return;
                } else throw 'BD error'; //Если ошибка пришла с БД, то ходим на catch      
            }

            //Если с бд пришел пустой ответ (пользователь не найден)
            if (!result.res.rowCount)
            {
                //Отправляем 404 в ответ
                ctx.status = 404;
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['404']
                }
                return;
            }

            //Если все хорошо
            ctx.status = 200;
            ctx.body = {
                sucess: true,
                data: { user: result.res.rows[0]}
            };       
        } 
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })  
    //Создание пользователя.
    .post('/users.create', async (ctx) =>{
        try {
            //загружаем с бд список пользователей (user_id, username)
            let result = await users.getUserByName({username: ctx.request.body.username});
            
            //Если во время проверки username на свободность произошла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if(result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                    return;
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch      
            }

            //Если совпанение по username найдено (имя занято)
            if (result.res.rowCount)
            {
                ctx.status = 400
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['10']
                }
                return;
            }

            //Если имя пользователя свободно, то...
            result = await users.createUser({...ctx.request.body})

            //Если во время создания пользователя произошла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if (result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                    return;
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch      
            }

            //Если все хорошо, то отправляем в ответ 201 (created)
            ctx.status = 201;
            ctx.body = {
                sucess: true,
            }; 
        } 
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Обновление данных юзера(пароля).
    .put('/users.edit', async (ctx) =>{
        try{
            //Отправляем запрос, на смену пароля
            const result = await  users.updateUserPassword({...ctx.request.body})

            //Если пришла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if (result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                    return;
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch      
            }
            console.log(result);       
            //Введена неверная инфа(имя и пароль)
            if (!result.res.rowCount){
                //отправляем статус 401
                ctx.status = 401;
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['401']
                }
                return;
            }

            //Если все хорошо, то отправляем в ответ 201 (created)
            ctx.status = 200;
            ctx.body = {
                sucess: true
            }; 
        } 
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Удаление пользователя
    //username и password передаются параментрами через адресную строку
    .delete('/users.delete/:username/:password/:session_id', async (ctx) =>{
        try{
            //Отправляем запрос, на удаление юзера
            const result = await  users.deleteUser({...ctx.params})
            console.log(result);    
            //Если пришла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if (result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                    return;
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch      
            }

            //Если при удалении удалилось 0 строк(Введена не верная инфа)
            if (!result.res.rowCount){
                //отправляем статус 401
                ctx.status = 401;
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['401']
                }
                return;
            }

            //Если все хорошо, то отправляем в ответ 201 (created)
            ctx.status = 200;
            ctx.body = {
                sucess: true
            }; 
        } 
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
    })
    //Логин - принимает username, password возвращает session_id
    //Либо принимает session_id, возвращает user_id, username, admin
    .put('/login', async (ctx) =>{
        try{
            let result = null;

            //Если получаем session_id
            if (ctx.request.body.session_id)
            {
                //Проверка аунтефикации по session_id
                result = await auth.loginBySessionId({session_id: ctx.request.body.session_id});
            } else {
                //Проверка аунтефикации по login, password
                result = await auth.login({...ctx.request.body});
            } 

            //Если пришла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if (result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch 
                return;     
            }  

             //Если совпадения в бд не найдено
             //Отправляем ошибку 401
             if (!result.res.rowCount){
                //отправляем статус 401
                ctx.status = 401;
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['401']
                }
                return;
            }

            //Если все хорошо
            ctx.status = 200;
            if (ctx.request.body.session_id){
                
                ctx.body = { 
                    sucess: true,
                    data: {
                        user_id:  result.res.rows[0].user_id,
                        username: result.res.rows[0].username,  
                        admin: result.res.rows[0].admin  
                    }           
                } 
            } else {
                //Генерируем sessionId ((рандомное число)*1000 + (имя пользователя) + (хэш пароля) + (рандомное число)*1000) и хэшируется вся строка.
                //Затем хэшируем
                const session_id = md5(String(Math.random() * 1000) + String(ctx.request.body.username) + String(md5(ctx.request.body.password)) + String(Math.random()*1000));
                await auth.setSessionId(ctx.request.body.username, session_id);
                ctx.body = { 
                    session_id,
                    sucess: true,      
                } 
            }

        }
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
        
    })
    //Логаут. Очищает session_id у пользователя
    .put('/logout', async (ctx) =>{
        try{
            const result = await auth.endSession({...ctx.request.body});

            //Если пришла ошибка
            if (result.err)
            {              
                //Если обшибка 400 (Bad Request)
                if (result.err.code == 400){
                    ctx.status = 400;
                    ctx.body = { 
                        sucess: false,
                        error: errorTable.errors['400']
                    }; 
                } else throw 'BD err'; //Если ошибка пришла с БД, то ходим на catch 
                return;     
            }  

             //Если совпадения в бд не найдено
             //Отправляем ошибку 401
             if (!result.res.rowCount){
                //отправляем статус 401
                ctx.status = 401;
                ctx.body = {
                    sucess: false,
                    error: errorTable.errors['401']
                }
                return;
            }

            //Если все хорошо
            ctx.status = 200;
            ctx.body = {
                sucess: true
            };
        }
        catch (err){
            console.error('Error: ', err);
            ctx.status = 500;
            ctx.body = {
                sucess: false,
                error: errorTable.errors['500']
            }
        }
        
    });

module.exports = router;