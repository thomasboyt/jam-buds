import { Router } from 'express';

import {
  UserModel,
  getUserByName,
  serializePublicUser,
  getUserProfileForUser,
} from '../models/user';

import {
  followUser,
  unfollowUser,
  getFollowingForUserId,
  getFollowersForUserId,
} from '../models/following';

import { isAuthenticated } from '../auth';

import { Followers, Following } from '../resources';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import config from '../config';
import proxy = require('http-proxy-middleware');

export default function registerUserEndpoints(router: Router) {
  const target = config.require('JB_RHIANNON_URL');
  router.use('/me', proxy({ target }));

  // follow a user
  router.post(
    '/following',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;
      const followingName: string = req.body.userName;

      if (!followingName) {
        res.status(400).json({
          error: 'Missing userName parameter in body',
        });

        return;
      }

      const followingUser = await getUserByName(followingName);

      if (!followingUser) {
        res.status(400).json({
          error: `Could not find user with name ${followingName}`,
        });

        return;
      }

      await followUser(user.id, followingUser.id);

      res.json({
        user: serializePublicUser(followingUser),
      });
    })
  );

  // unfollow a user
  router.delete(
    '/following/:followingName',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;
      const followingName: string = req.params.followingName;

      const followingUser = await getUserByName(followingName);

      if (!followingUser) {
        res.status(400).json({
          error: `Could not find user with name ${followingName}`,
        });

        return;
      }

      await unfollowUser(user.id, followingUser.id);

      res.json({
        success: true,
      });
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
