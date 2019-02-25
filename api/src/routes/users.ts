import { Router } from 'express';

import {
  UserModel,
  getUserByName,
  serializePublicUser,
  getUnfollowedUsersByTwitterIds,
  getUserProfileForUser,
  serializeCurrentUser,
  serializePublicUserWithTwitterName,
} from '../models/user';

import {
  followUser,
  unfollowUser,
  getFollowingForUserId,
  getFollowersForUserId,
} from '../models/following';

import { getUserFromRequest, isAuthenticated } from '../auth';
import { getTwitterFriendIds } from '../apis/twitter';

import { Followers, Following } from '../resources';
import wrapAsyncRoute from '../util/wrapAsyncRoute';

export default function registerUserEndpoints(router: Router) {
  // get information about the current user
  router.get(
    '/me',
    wrapAsyncRoute(async (req, res) => {
      const userModel = await getUserFromRequest(req);

      if (!userModel) {
        return res.json({
          user: null,
        });
      }

      res.json({
        user: await serializeCurrentUser(userModel),
      });
    })
  );

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

  // get twitter friends who have signed up
  router.get(
    '/friend-suggestions',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const ids = await getTwitterFriendIds(res.locals.user);

      const users = await getUnfollowedUsersByTwitterIds(
        res.locals.user.id,
        ids
      );

      const publicUsers = users.map((row) =>
        serializePublicUserWithTwitterName(row)
      );

      res.status(200).send({
        users: publicUsers,
      });
    })
  );

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
