import { Router } from 'express';
import proxy from 'http-proxy-middleware';

import {
  getUserByName,
  serializePublicUser,
  getUserProfileForUser,
} from '../models/user';

import {
  getFollowingForUserId,
  getFollowersForUserId,
} from '../models/following';

import { Followers, Following } from '../resources';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
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

  router.get(
    '/users/:userName/following',
    wrapAsyncRoute(async (req, res) => {
      const userName: string = req.params.userName;

      const user = await getUserByName(userName);

      if (!user) {
        res.status(400).json({
          error: `Could not find user with name ${userName}`,
        });

        return;
      }

      const following = await getFollowingForUserId(user.id);

      const publicUsers = following.map((row) => serializePublicUser(row));

      const resp: Following = {
        userProfile: await getUserProfileForUser(user),
        users: publicUsers,
      };

      res.json(resp);
    })
  );

  router.get(
    '/users/:userName/followers',
    wrapAsyncRoute(async (req, res) => {
      const userName: string = req.params.userName;

      const user = await getUserByName(userName);

      if (!user) {
        res.status(400).json({
          error: `Could not find user with name ${userName}`,
        });

        return;
      }

      const followers = await getFollowersForUserId(user.id);

      const publicUsers = followers.map((row) => serializePublicUser(row));

      const resp: Followers = {
        userProfile: await getUserProfileForUser(user),
        users: publicUsers,
      };

      res.json(resp);
    })
  );
}
