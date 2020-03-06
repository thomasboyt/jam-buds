import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import config from '../config';

export function registerSpotifyAuthEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/spotify-connect', proxy({ target }));
}

export function registerSpotifyApiEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/spotify-token', proxy({ target }));
}
