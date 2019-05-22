import { Router } from 'express';

import {
  UserModel,
  getUserByName,
  getUserProfileForUser,
} from '../models/user';
import { getPlaylistEntriesByUserId } from '../models/post';
import { getFeedByUserId } from '../models/feed';
import { getLikesByUserId } from '../models/like';

import { getUserFromRequest, isAuthenticated } from '../auth';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { Playlist, Feed } from '../resources';

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

      const previousId =
        req.query.previousId && parseInt(req.query.previousId, 10);

      const tracks = await getPlaylistEntriesByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        previousId,
      });

      const resp: Playlist = {
        userProfile: await getUserProfileForUser(user),
        tracks,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

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

      const previousId =
        req.query.previousId && parseInt(req.query.previousId, 10);

      const tracks = await getLikesByUserId(user.id, {
        currentUserId: currentUser ? currentUser.id : undefined,
        previousId,
      });

      const resp: Playlist = {
        userProfile: await getUserProfileForUser(user),
        tracks,
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
      const beforeTimestamp = req.query.beforeTimestamp;

      const items = await getFeedByUserId(user.id, {
        currentUserId: user.id,
        beforeTimestamp,
      });

      const feed: Feed = {
        tracks: items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(feed);
    })
  );
}
