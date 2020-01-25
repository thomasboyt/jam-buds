import Koa from 'koa';
import Router from '@koa/router';
import { errorHandler } from 'restea';

import { configureDatabase } from './db';
import { registerPlaylistRoutes } from './routes/playlists';

export function createApp() {
  const server = new Koa();
  server.use(errorHandler());

  const router = new Router<{}>();
  registerPlaylistRoutes(router);
  server.use(router.routes());

  configureDatabase();

  return server;
}
