import { Router } from 'express';
import proxy from 'http-proxy-middleware';

import config from '../config';

export default function registerPlaylistEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
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
  router.use(
    '/playlists',
    proxy({
      target,
    })
  );
}
