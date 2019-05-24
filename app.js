import Koa from 'koa';
const app = new Koa();

import KoaCors from '@koa/cors';
import router from './router'
import KoaBody from 'koa-body';
import errorTable from './errorTable'

//Cros
app.use(KoaCors({
    allowMethods: ['GET', 'POST', 'PUT' , 'DELETE'],
    allowHeaders: ['Content-type'],
}));

//use plugins
app.use(KoaBody())
app.use(router.routes());
app.use(router.allowedMethods());

app.use(async (ctx)=>{
    ctx.status = 404;
    ctx.body={
        success: false,
        err: errorTable.errors['404']
    }
});

app.listen(3000);