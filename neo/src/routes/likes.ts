import Router from '@koa/router';
import {
  compose,
  description,
  returns,
  NoContent,
  integer,
  parameter,
} from 'restea';
import { requireAuthMiddleware } from '../utils/authMiddleware';
import { AppCtx } from '../createApp';
import { likeSong, unlikeSong } from '../logic/likes';

export function registerLikesRoutes(router: Router<{}, AppCtx>) {
  router.put(
    '/api/likes/:songId',
    compose(
      requireAuthMiddleware(),
      description('Like a song by ID.'),
      parameter('songId', integer(), {
        description: 'The ID of the song to like',
      }),
      returns(NoContent({}))
    ),
    async (ctx) => {
      const { currentUser, params } = ctx.state;
      const { songId } = params;
      await likeSong(ctx.jareth, { currentUserId: currentUser.id, songId });
    }
  );

  router.delete(
    '/api/likes/:songId',
    compose(
      requireAuthMiddleware(),
      description('Unlike a song by ID.'),
      parameter('songId', integer(), {
        description: 'The ID of the song to unlike',
      }),
      returns(NoContent({}))
    ),
    async (ctx) => {
      const { currentUser, params } = ctx.state;
      const { songId } = params;
      await unlikeSong(ctx.jareth, { currentUserId: currentUser.id, songId });
    }
  );
}
