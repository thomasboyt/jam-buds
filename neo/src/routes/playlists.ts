import Router from '@koa/router';
import {
  compose,
  query,
  date,
  description,
  Ok,
  returns,
  parameter,
  HttpError,
  string,
} from 'restea';
import { anyString } from '../utils/restea/anyString';

import {
  getPublicFeed,
  getUserFeed,
  getUserPlaylist,
  getUserLikedPlaylist,
} from '../logic/playlists';
import {
  requireAuthMiddleware,
  optionalAuthMiddleware,
} from '../utils/authMiddleware';
import { AppCtx } from '../createApp';
import { getUserProfileOrNull } from '../logic/users';
import { feedSchema, userPlaylistWithProfileSchema } from '../resources';

export function registerPlaylistRoutes(router: Router<{}, AppCtx>) {
  const timestampPaginationMiddleware = compose(
    query('before', date(), {
      description: 'A timestamp used as a pagination cursor.',
    }),
    query('after', date(), {
      description: 'A timestamp used as a pagination cursor.',
    })
  );

  router.get(
    '/api/feed',
    compose(
      // sets ctx.state.currentUser or throws if not logged in
      requireAuthMiddleware(),

      description('Get the feed for the current user.'),
      timestampPaginationMiddleware,
      returns(Ok(feedSchema))
    ),
    async (ctx) => {
      const { before, after } = ctx.state.params;
      const { currentUser } = ctx.state;
      const playlist = await getUserFeed(ctx.jareth, {
        currentUserId: currentUser.id,
        beforeTimestamp: before || null,
        afterTimestamp: after || null,
        limit: 20,
      });
      ctx.state.returns = playlist;
    }
  );

  router.get(
    '/api/public-feed',
    compose(
      optionalAuthMiddleware(),
      description('Fetch the public feed.'),
      timestampPaginationMiddleware,
      returns(Ok(feedSchema))
    ),
    async (ctx /*, next*/) => {
      const { currentUser, params } = ctx.state;
      const { before, after } = params;

      const playlist = await getPublicFeed(ctx.jareth, {
        beforeTimestamp: before || null,
        afterTimestamp: after || null,
        currentUserId: currentUser ? currentUser.id : null,
        limit: 20,
      });
      ctx.state.returns = playlist;
    }
  );

  router.get(
    '/api/playlists/:userName',
    compose(
      optionalAuthMiddleware(),
      description("Fetch a user's playlist and profile."),
      timestampPaginationMiddleware,
      query('type', string('mixtapes'), {
        description: 'Filter the specific type of item returned',
      }),
      parameter('userName', anyString(), {
        description: 'The name of the user',
      }),
      returns(Ok(userPlaylistWithProfileSchema))
    ),
    async (ctx) => {
      const { currentUser, params } = ctx.state;
      const { before, after, userName } = params;

      const userProfile = await getUserProfileOrNull(ctx.jareth, userName);

      if (!userProfile) {
        throw new HttpError(
          404,
          'USER_NOT_FOUND',
          `Could not find user with name ${userName}`
        );
      }

      const playlist = await getUserPlaylist(ctx.jareth, userProfile.id, {
        beforeTimestamp: before || null,
        afterTimestamp: after || null,
        currentUserId: currentUser ? currentUser.id : null,
        limit: 20,
        onlyMixtapes: params.type === 'mixtapes',
      });

      ctx.state.returns = {
        ...playlist,
        userProfile,
      };
    }
  );

  router.get(
    '/api/playlists/:userName/liked',
    compose(
      optionalAuthMiddleware(),
      description("Fetch a user's liked playlist and profile."),
      timestampPaginationMiddleware,
      parameter('userName', anyString(), {
        description: 'The name of the user',
      }),
      returns(Ok(userPlaylistWithProfileSchema))
    ),
    async (ctx) => {
      const { currentUser, params } = ctx.state;
      const { before, after, userName } = params;

      const userProfile = await getUserProfileOrNull(ctx.jareth, userName);

      if (!userProfile) {
        throw new HttpError(
          404,
          'USER_NOT_FOUND',
          `Could not find user with name ${userName}`
        );
      }

      const playlist = await getUserLikedPlaylist(ctx.jareth, userProfile.id, {
        beforeTimestamp: before || null,
        afterTimestamp: after || null,
        currentUserId: currentUser ? currentUser.id : null,
        limit: 20,
      });

      ctx.state.returns = {
        ...playlist,
        userProfile,
      };
    }
  );
}
