import { Router } from 'express';
import proxy from 'http-proxy-middleware';

import config from '../config';
import { restream } from '../util/restream';

export default function registerUserEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/me', proxy({ target }));

  router.use(
    '/following',
    proxy({
      target,
      onProxyReq: restream,
    })
  );

  router.use('/friend-suggestions', proxy({ target }));

  router.use('/users', proxy({ target })); // followers/following endpoints
}
