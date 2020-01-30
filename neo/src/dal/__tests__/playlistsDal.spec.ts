import { dbTest, withTestTransaction } from '../../utils/testUtils/dbTest';
import {
  likeSong,
  createUser,
  createSong,
  createSongPost,
} from '../../utils/testUtils/factories';
import { getLikedPostsForUser, getPostsForUser } from '../playlistsDal';

describe('playlistsDal', () => {
  dbTest();

  describe('getPostsForUser', () => {
    it("only includes the user's posts", () => {
      return withTestTransaction(async (handle) => {
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: false,
        });
        const jeffSongId = await createSong(handle);
        await createSongPost(handle, { userId: jeffId, songId: jeffSongId });

        const vinnyId = await createUser(handle, {
          name: 'vinny',
          showInPublicFeed: false,
        });
        const vinSongId = await createSong(handle);
        await createSongPost(handle, { userId: vinnyId, songId: vinSongId });

        const posts = await getPostsForUser(handle, {
          beforeTimestamp: null,
          afterTimestamp: null,
          limit: 20,
          userId: jeffId,
          onlyMixtapes: false,
        });
        expect(posts.length).toEqual(1);
        expect(posts[0].songId).toEqual(jeffSongId);
      });
    });

    // TODO
    it.todo('allows filtering to show only mixtapes');

    // TODO
    it.todo('sorts & paginates correctly');
  });

  describe('getLikedPostsForUser', () => {
    it("only includes the user's liked posts", () => {
      return withTestTransaction(async (handle) => {
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: false,
        });
        const jeffSongId = await createSong(handle);
        await likeSong(handle, { userId: jeffId, songId: jeffSongId });

        const vinnyId = await createUser(handle, {
          name: 'vinny',
          showInPublicFeed: false,
        });
        const vinSongId = await createSong(handle);
        await likeSong(handle, { userId: vinnyId, songId: vinSongId });

        const posts = await getLikedPostsForUser(handle, {
          beforeTimestamp: null,
          afterTimestamp: null,
          limit: 20,
          userId: jeffId,
        });
        expect(posts.length).toEqual(1);
        expect(posts[0].songId).toEqual(jeffSongId);
      });
    });

    // TODO
    it.todo('sorts & paginates correctly');
  });
});
