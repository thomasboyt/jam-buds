import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';

export default function registerSearchEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/spotify-search', proxy({ target }));
  router.use('/spotify-details', proxy({ target }));
}
