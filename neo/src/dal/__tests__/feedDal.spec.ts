import expect from 'expect';
import { Handle } from '@tboyt/jareth';

import { dbTest, withTestTransaction } from '../../utils/testUtils/dbTest';
import {
  createUser,
  createSong,
  createSongPost,
  followUser,
} from '../../utils/testUtils/factories';
import {
  getAggregatedPostsForPublicFeed,
  getAggregatedPostsForUserFeed,
} from '../feedDal';

describe('feedDal', () => {
  dbTest();

  describe('getAggregatedPostsForPublicFeed', () => {
    it('only incudes posts from public users', async () => {
      await withTestTransaction(async (handle: Handle) => {
        // Create a public post
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });
        const jeffSongId = await createSong(handle);
        await createSongPost(handle, { userId: jeffId, songId: jeffSongId });

        // Create a private post
        const vinnyId = await createUser(handle, {
          name: 'vinny',
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

    it('correctly sorts and paginates', async () => {
      const limit = 20;

      await withTestTransaction(async (handle: Handle) => {
        const userId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });

        const songIds = [];
        for (let i = 0; i < 50; i += 1) {
          const songId = await createSong(handle);
          await createSongPost(handle, { songId, userId });
          songIds.push(songId);
        }

        songIds.reverse();

        // first page of results has the first 20 items sorted
        // reverse-chronological
        const firstPage = await getAggregatedPostsForPublicFeed(handle, {
          beforeTimestamp: null,
          afterTimestamp: null,
          limit,
        });
        expect(firstPage.map((post) => post.songId)).toEqual(
          songIds.slice(0, limit)
        );

        // second page of results using before timestamp has the next 20 items
        // sorted reverse-chronological
        let lastItemTimestamp = firstPage[firstPage.length - 1].timestamp;
        const secondPage = await getAggregatedPostsForPublicFeed(handle, {
          beforeTimestamp: lastItemTimestamp,
          afterTimestamp: null,
          limit,
        });
        expect(secondPage.map((post) => post.songId)).toEqual(
          songIds.slice(limit, limit + limit)
        );

        // getting results using after timestamp does not have a limit
        lastItemTimestamp = secondPage[secondPage.length - 1].timestamp;
        const afterResults = await getAggregatedPostsForPublicFeed(handle, {
          beforeTimestamp: null,
          afterTimestamp: lastItemTimestamp,
          limit,
        });
        expect(afterResults.map((post) => post.songId)).toEqual(
          songIds.slice(0, limit + limit)
        );
      });
    });

    it('aggregates posts of the same song', async () => {
      await withTestTransaction(async (handle: Handle) => {
        const songId = await createSong(handle);
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });
        const jeffPostTimestamp = await createSongPost(handle, {
          userId: jeffId,
          songId,
        });

        const vinnyId = await createUser(handle, {
          name: 'vinny',
          showInPublicFeed: true,
        });
        await createSongPost(handle, { userId: vinnyId, songId });

        const posts = await getAggregatedPostsForPublicFeed(handle, {
          beforeTimestamp: null,
          afterTimestamp: null,
          limit: 20,
        });

        expect(posts).toHaveLength(1);
        expect(posts[0]).toHaveProperty('songId', songId);
        expect(posts[0]).toHaveProperty('userNames', ['jeff', 'vinny']);
        expect(posts[0]).toHaveProperty('timestamp', jeffPostTimestamp);
      });
    });
  });

  describe('getAggregatedPostsForUserFeed', () => {
    it('returns posts from only users followed and themselves', async () => {
      await withTestTransaction(async (handle) => {
        const createUserAndPost = async (name: string) => {
          const id = await createUser(handle, {
            name,
            showInPublicFeed: true,
          });
          await createSongPost(handle, {
            userId: id,
            songId: await createSong(handle),
          });
          return id;
        };

        const jeffId = await createUserAndPost('jeff');
        const vinnyId = await createUserAndPost('vinny');
        const bradId = await createUserAndPost('brad');
        await createUserAndPost('ben');

        await followUser(handle, { userId: jeffId, followingId: vinnyId });
        await followUser(handle, { userId: jeffId, followingId: bradId });

        const posts = await getAggregatedPostsForUserFeed(handle, {
          currentUserId: jeffId,
          beforeTimestamp: null,
          afterTimestamp: null,
          limit: 20,
        });

        expect(posts.map((post) => post.userNames[0])).toEqual([
          'brad',
          'vinny',
          'jeff',
        ]);
      });
    });

    // TODO
    it.todo('correctly sorts and paginates');

    // TODO
    //
    // - Test that timestamp is set to _your_ post of a song
    it.todo('aggregates posts of the same song');
  });
});
