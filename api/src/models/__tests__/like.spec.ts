import expect from 'expect';
import { songFactory, userFactory } from '../../__tests__/factories';

import { createLike, likeExists, removeLike, getLikesByUserId } from '../like';

describe('models/like', () => {
  describe('likeExists', () => {
    it('returns the liked state for a given song and user', async () => {
      const user = await userFactory();
      const { id } = await songFactory();

      const params = { userId: user.id, songId: id };

      await createLike(params);
      let hasLike = await likeExists(params);
      expect(hasLike).toBe(true);

      await removeLike(params);
      hasLike = await likeExists(params);
      expect(hasLike).toBe(false);
    });
  });

  describe('getLikesByUserId', () => {
    it("returns a user's liked songs", async () => {
      const user = await userFactory();
      const { id } = await songFactory();
      await createLike({ userId: user.id, songId: id });

      const items = await getLikesByUserId(user.id, { currentUserId: user.id });
      expect(items.length).toBe(1);
      expect(items[0].song.id).toBe(id);
    });
  });
});
