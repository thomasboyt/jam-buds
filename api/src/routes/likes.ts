import { Router } from 'express';

import proxy from 'http-proxy-middleware';
import config from '../config';

export default function registerLikesEndpoints(router: Router) {
  const target = config.require('JB_NEO_URL');
  router.use(
    '/likes/:songId',
    proxy({
      target,
    })
  );
}
