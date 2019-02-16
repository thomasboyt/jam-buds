import expect from 'expect';
import { songFactory, userFactory } from '../../__tests__/factories';

import { createLike, likeExists, removeLike } from '../like';

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
});
