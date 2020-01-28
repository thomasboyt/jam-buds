import { Router } from 'express';
import proxy from 'http-proxy-middleware';

import config from '../config';

export default function registerPlaylistEndpoints(router: Router) {
  const target = config.require('JB_NEO_URL');
  router.use(
    '/playlists/:userName',
    proxy({
      target,
    })
  );
  router.use(
    '/feed',
    proxy({
      target,
    })
  );
  router.use(
    '/public-feed',
    proxy({
      target,
    })
  );
}
