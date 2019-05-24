//Основная точка входа приложения
require('babel-core/register')({
    presets: ['es2015-node5', 'stage-3']
});

//Загрузка кода koa2
require('./app')