import expect from 'expect';
import { Handle } from '@tboyt/jareth';

import { dbTest, withTestTransaction } from '../../utils/testUtils/dbTest';
import {
  createUser,
  createSong,
  createSongPost,
} from '../../utils/testUtils/factories';
import { getAggregatedPostsForPublicFeed } from '../feedDal';

describe('feedDal', () => {
  dbTest();

  describe('getAggregatedPostsForPublicFeed', () => {
    it('only incudes posts from public users', async () => {
      await withTestTransaction(async (handle: Handle) => {
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });
        const jeffSongId = await createSong(handle);
        await createSongPost(handle, { userId: jeffId, songId: jeffSongId });

        const vinnyId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: false,
        });
        const vinSongId = await createSong(handle);
        await createSongPost(handle, { userId: vinnyId, songId: vinSongId });

        const posts = await getAggregatedPostsForPublicFeed(handle, {
          beforeTimestamp: null,
          afterTimestamp: null,
          limit: 20,
        });

        expect(posts).toHaveLength(1);
        expect(posts[0]).toHaveProperty('songId', jeffSongId);
      });
    });
  });
});
