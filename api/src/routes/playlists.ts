import { Router } from 'express';

import {
  UserModel,
  getUserByName,
  getUserProfileForUser,
} from '../models/user';
import {
  getPostsByUserId,
  getLikesByUserId,
  getFeedByUserId,
  getPublicFeed,
  getPublishedMixtapesByUserId,
} from '../models/playlists';

import { getUserFromRequest, isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { UserPlaylist, Playlist } from '../resources';

export default function registerPlaylistEndpoints(router: Router) {
  // get a user's playlist
  router.get(
    '/playlists/:userName',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUserByName(userName);
      const currentUser = await getUserFromRequest(req);

      if (!user) {
        res.status(404).json({
          error: `No user found with name ${userName}`,
        });

        return;
      }

      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getPostsByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        beforeTimestamp,
        afterTimestamp,
      });

      const resp: UserPlaylist = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

  // get a user's likes
  router.get(
    '/playlists/:userName/liked',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUserByName(userName);
      const currentUser = await getUserFromRequest(req);

      if (!user) {
        res.status(404).json({
          error: `No user found with name ${userName}`,
        });

        return;
      }

      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getLikesByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        beforeTimestamp,
        afterTimestamp,
      });

      const resp: UserPlaylist = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

  router.get(
    '/feed',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      // TODO: validate
      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getFeedByUserId(user.id, {
        currentUserId: user.id,
        beforeTimestamp,
        afterTimestamp,
      });

      const feed: Playlist = {
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(feed);
    })
  );

  router.get(
    '/public-feed',
    wrapAsyncRoute(async (req, res) => {
      const currentUser = await getUserFromRequest(req);

      // TODO: validate
      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getPublicFeed({
        currentUserId: currentUser ? currentUser.id : undefined,
        beforeTimestamp,
        afterTimestamp,
      });

      const feed: Playlist = {
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(feed);
    })
  );

  // Get mixtapes for a specific user
  router.get(
    '/users/:userName/mixtapes',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUserByName(userName);
      const currentUser = await getUserFromRequest(req);

      if (!user) {
        res.status(400).json({
          error: `Could not find user with name ${userName}`,
        });

        return;
      }

      const beforeTimestamp = req.query.before;
      const afterTimestamp = req.query.after;

      const items = await getPublishedMixtapesByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        beforeTimestamp,
        afterTimestamp,
      });

      const resp: UserPlaylist = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );
}
