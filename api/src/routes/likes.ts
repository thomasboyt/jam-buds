import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';
import { restream } from '../util/restream';

export default function registerLikesEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use(/\/likes/, proxy({ target, onProxyReq: restream }));
}
