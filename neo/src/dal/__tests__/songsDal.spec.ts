import { dbTest, withTestTransaction } from '../../utils/testUtils/dbTest';
import {
  createUser,
  createSong,
  likeSong,
} from '../../utils/testUtils/factories';
import { getSongsByIds } from '../songsDal';

describe('songsDal', () => {
  dbTest();

  describe('getSongsByIds', () => {
    it('includes whether the current user has liked a song', () => {
      return withTestTransaction(async (handle) => {
        const songId = await createSong(handle);

        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: false,
        });
        const vinnyId = await createUser(handle, {
          name: 'vinny',
          showInPublicFeed: false,
        });

        await likeSong(handle, { userId: jeffId, songId });

        // as an anonymous user, returns false
        let [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: -1,
        });

        expect(song.isLiked).toBe(false);

        // as a user who did not like the song, it should return false
        [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: vinnyId,
        });

        expect(song.isLiked).toBe(false);

        // as a user who did like the song, it should return true
        [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: jeffId,
        });

        expect(song.isLiked).toBe(true);
      });
    });

    it('includes the total like count of the song', () => {
      return withTestTransaction(async (handle) => {
        const songId = await createSong(handle);

        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: false,
        });
        const vinnyId = await createUser(handle, {
          name: 'vinny',
          showInPublicFeed: false,
        });

        let [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: -1,
        });
        expect(song.likeCount).toEqual('0');

        await likeSong(handle, { userId: jeffId, songId });
        [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: -1,
        });
        expect(song.likeCount).toEqual('1');

        await likeSong(handle, { userId: vinnyId, songId });
        [song] = await getSongsByIds(handle, {
          songIds: [songId],
          currentUserId: -1,
        });
        expect(song.likeCount).toEqual('2');
      });
    });
  });
});
