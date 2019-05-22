import expect from 'expect';

import { userFactory, postFactory } from '../../__tests__/factories';
import {
  deletePostById,
  getOwnPostForSongId,
  getPlaylistEntryBySongId,
} from '../post';

describe('models/post', () => {
  describe('deleteEntryById', () => {
    it('deletes a posted entry', async () => {
      const user = await userFactory();
      const entry = await postFactory({ userId: user.id });
      const post = await getOwnPostForSongId({
        userId: user.id,
        songId: entry.song.id,
      });

      expect(
        await getPlaylistEntryBySongId(entry.song.id, user.id, user.id)
      ).toExist();

      await deletePostById(post!.id);

      expect(
        await getPlaylistEntryBySongId(entry.song.id, user.id, user.id)
      ).toNotExist();
    });
  });
});
