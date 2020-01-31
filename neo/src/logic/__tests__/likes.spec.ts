import { dbTest, withTestTransaction } from '../../utils/testUtils/dbTest';
import { createUser, createSong } from '../../utils/testUtils/factories';

import * as likesDal from '../../dal/likesDal';
import { likeSong, unlikeSong } from '../likes';

describe('logic/likes', () => {
  dbTest();

  describe('#likeSong', () => {
    it('creates a like', () => {
      return withTestTransaction(async (handle) => {
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });

        const songId = await createSong(handle);

        await likeSong(handle, { songId, currentUserId: jeffId });

        const likeExists = await likesDal.songLikeExists(handle, {
          userId: jeffId,
          songId,
        });

        expect(likeExists).toBe(true);
      });
    });
  });

  describe('#unlikeSong', () => {
    it('removes a like', () => {
      return withTestTransaction(async (handle) => {
        const jeffId = await createUser(handle, {
          name: 'jeff',
          showInPublicFeed: true,
        });

        const songId = await createSong(handle);

        await likeSong(handle, { songId, currentUserId: jeffId });

        await unlikeSong(handle, { songId, currentUserId: jeffId });

        const likeExists = await likesDal.songLikeExists(handle, {
          userId: jeffId,
          songId,
        });

        expect(likeExists).toBe(false);
      });
    });
  });
});
