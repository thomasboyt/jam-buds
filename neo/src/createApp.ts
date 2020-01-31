import Koa, { Middleware } from 'koa';
import Router from '@koa/router';
import { errorHandler } from 'restea';
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';

import { configureDatabase } from './db';
import { jarethMiddleware, JarethCtx } from './utils/jarethMiddleware';
import config from './config';

import { registerLikesRoutes } from './routes/likes';
import { registerPlaylistRoutes } from './routes/playlists';

export type AppCtx = JarethCtx;

// Logs _all_ errors, including e.g. 400 or 404. Will probably need tweaking
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

  registerLikesRoutes(router);
  registerPlaylistRoutes(router);

  server.use(router.routes());

  Sentry.init({
    dsn: config.get('SENTRY_DSN_NEO'),
    integrations: [
      new RewriteFrames({
        root: (global as any).__rootdir__,
      }),
    ],
  });

  server.on('error', (err, ctx) => {
    Sentry.withScope(function(scope) {
      scope.addEventProcessor(function(event) {
        return Sentry.Handlers.parseRequest(event, ctx.request);
      });
      Sentry.captureException(err);
    });
  });

  return server;
}
