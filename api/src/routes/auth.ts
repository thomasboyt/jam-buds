import { Router } from 'express';
import proxy from 'http-proxy-middleware';

import config from '../config';
import { restream } from '../util/restream';

export function registerAuthEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/sign-in', proxy({ target, onProxyReq: restream }));
}

export function registerAuthApiEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/sign-out', proxy({ target, onProxyReq: restream }));
  router.use('/sign-in-token', proxy({ target, onProxyReq: restream }));
  router.use('/registration', proxy({ target, onProxyReq: restream }));
}
