import Koa, { Middleware } from 'koa';
import Router from '@koa/router';
import { errorHandler } from 'restea';

import { configureDatabase } from './db';
import { registerPlaylistRoutes } from './routes/playlists';
import { jarethMiddleware, JarethCtx } from './utils/jarethMiddleware';

export type AppCtx = JarethCtx;

function logErrorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.log('\nError in:', ctx.request.method, ctx.request.url);
      console.log(err);
      throw err;
    }
  };
}

export function createApp() {
  const jareth = configureDatabase();

  const server = new Koa<{}, AppCtx>();
  server.use(errorHandler());
  server.use(logErrorHandler());
  server.use(jarethMiddleware(jareth));

  const router = new Router<{}, AppCtx>();
  registerPlaylistRoutes(router);
  server.use(router.routes());

  return server;
}
