import expect from 'expect';

import { userFactory, postFactory } from '../../__tests__/factories';
import { deletePostById, getOwnPostForSongId } from '../post';

describe('models/post', () => {
  describe('deleteEntryById', () => {
    it('deletes a posted entry', async () => {
      const user = await userFactory();
      const entry = await postFactory({ userId: user.id });
      const post = await getOwnPostForSongId({
        userId: user.id,
        songId: entry.songId,
      });

      expect(post).toBeTruthy();

      await deletePostById(post!.id);

      expect(
        await getOwnPostForSongId({
          userId: user.id,
          songId: entry.songId,
        })
      ).toBeFalsy();
    });
  });
});
