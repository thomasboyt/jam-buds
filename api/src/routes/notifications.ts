import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import { restream } from '../util/restream';
import config from '../config';

export default function registerNotificationsEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use(
    '/notifications',
    proxy({
      target,
      onProxyReq: restream,
    })
  );
}
