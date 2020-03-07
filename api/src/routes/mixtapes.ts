import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';
import { restream } from '../util/restream';

export default function registerMixtapeEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');

  router.use(
    '/mixtapes',
    proxy({
      target,
      onProxyReq: restream,
    })
  );

  router.use(
    '/draft-mixtapes',
    proxy({
      target,
      onProxyReq: restream,
    })
  );
}
