import Router from '@koa/router';
import { compose, query, date, description, Ok, returns } from 'restea';

import * as PlaylistResource from '../resources/PlaylistResource';
import { getPublicFeed } from '../logic/playlists';

export function registerPlaylistRoutes(router: Router) {
  const timestampPaginationMiddleware = compose(
    query('before', date(), {
      description: 'A timestamp used as a pagination cursor.',
    }),
    query('after', date(), {
      description: 'A timestamp used as a pagination cursor.',
    })
  );

  router.get(
    '/api/public-feed',
    compose(
      description('Fetch the public feed.'),
      timestampPaginationMiddleware,
      returns(Ok(PlaylistResource.schema))
    ),
    async (ctx /*, next*/) => {
      const { before, after } = ctx.state.params;
      const playlist = await getPublicFeed({
        beforeTimestamp: before || null,
        afterTimestamp: after || null,
        currentUserId: null, // TODO
        limit: 20,
      });
      ctx.state.returns = playlist;
    }
  );
}
