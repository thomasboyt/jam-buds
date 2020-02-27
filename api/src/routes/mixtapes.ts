import { Router } from 'express';
import proxy from 'http-proxy-middleware';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

import { UserModel } from '../models/user';

import { isAuthenticated } from '../auth';
import { getDraftMixtapesByUserId } from '../models/mixtapes';
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

  // Get draft mixtapes for the current user
  router.get(
    '/draft-mixtapes',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user = res.locals.user as UserModel;

      const mixtapesList = await getDraftMixtapesByUserId(user.id);

      res.json(mixtapesList);
    })
  );
}
