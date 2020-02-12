import { Router, Request } from 'express';
import proxy from 'http-proxy-middleware';

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
import { JamBudsHTTPError } from '../util/errors';
import config from '../config';

async function getUser(userName: string): Promise<UserModel> {
  const user = await getUserByName(userName);

  if (!user) {
    throw new JamBudsHTTPError({
      statusCode: 404,
      message: `No user found with name ${userName}`,
    });
  }

  return user;
}

async function getPlaylistQueryOptions(
  req: Request,
  currentUser?: UserModel | null
) {
  if (!currentUser) {
    currentUser = await getUserFromRequest(req);
  }

  // TODO: validate these
  const beforeTimestamp = req.query.before;
  const afterTimestamp = req.query.after;

  return {
    currentUserId: currentUser ? currentUser.id : undefined,
    beforeTimestamp,
    afterTimestamp,
  };
}

export default function registerPlaylistEndpoints(router: Router) {
  // get a user's playlist
  router.get(
    '/playlists/:userName',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUser(userName);
      const queryOptions = await getPlaylistQueryOptions(req);

      const items = await getPostsByUserId(user.id, queryOptions);

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
      const user = await getUser(userName);
      const queryOptions = await getPlaylistQueryOptions(req);

      const items = await getLikesByUserId(user.id, queryOptions);

      const resp: UserPlaylist = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

  // Get mixtapes for a specific user
  router.get(
    '/users/:userName/mixtapes',
    wrapAsyncRoute(async (req, res) => {
      const userName = req.params.userName;
      const user = await getUser(userName);
      const queryOptions = await getPlaylistQueryOptions(req);

      const items = await getPublishedMixtapesByUserId(user.id, queryOptions);

      const resp: UserPlaylist = {
        userProfile: await getUserProfileForUser(user),
        items,
        limit: ENTRY_PAGE_LIMIT,
      };

      res.json(resp);
    })
  );

  if (config.get('ENABLE_RHIANNON')) {
    const target = config.require('JB_RHIANNON_URL');
    router.use(
      '/feed',
      proxy({
        target,
      })
    );
    router.use(
      '/public-feed',
      proxy({
        target,
      })
    );
  } else {
    router.get(
      '/feed',
      isAuthenticated,
      wrapAsyncRoute(async (req, res) => {
        const currentUser: UserModel = res.locals.user;
        const queryOptions = await getPlaylistQueryOptions(req, currentUser);

        const items = await getFeedByUserId(currentUser.id, queryOptions);

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
        const queryOptions = await getPlaylistQueryOptions(req);

        const items = await getPublicFeed(queryOptions);

        const feed: Playlist = {
          items,
          limit: ENTRY_PAGE_LIMIT,
        };

        res.json(feed);
      })
    );
  }
}
