import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';
import { restream } from '../util/restream';

export default function registerSettingsEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/settings', proxy({ target, onProxyReq: restream }));
}
