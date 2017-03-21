require('dotenv').config()

const admin = require('./firebase-admin');
const Koa = require('koa');
const router = require('koa-router')();
const app = new Koa();

async function firebaseAuthMiddleware(ctx, next) {
  const authorization = ctx.req.headers['authorization'];
  if (authorization) {
    try {
      let token = authorization.split(' ');
      let decodedToken = await admin.auth().verifyIdToken(token[1]);
      ctx.state.user = decodedToken;
      next();
    } catch (err) {
      console.log(err);
      ctx.status = 401;
    }
  } else {
      console.log('Authorization header is not found');
      ctx.status = 401;
  }
}

router.use('/api', firebaseAuthMiddleware);
router.get('/api/hello', function (ctx, next) {
  ctx.body = JSON.stringify({
      message: `You're logged in as ${ctx.state.user.email} with Firebase UID: ${ctx.state.user.uid}`
  });
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
