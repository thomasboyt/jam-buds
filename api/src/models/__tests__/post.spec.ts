import expect from 'expect';

import {
  userFactory,
  postFactory,
  mixtapeFactory,
} from '../../__tests__/factories';
import { deletePostById, getOwnPostForSongId, getPostsByUserId } from '../post';
import { PostListMixtapeItem } from '../../resources';

describe('models/post', () => {
  describe('getPostsByUserId', () => {
    it('includes published mixtapes', async () => {
      const user = await userFactory();
      await mixtapeFactory(user);

      const items = await getPostsByUserId(user.id);

      expect(items.length).toBe(1);
      expect(items[0].type).toBe('mixtape');
      const entry = items[0] as PostListMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(user.name);
    });
  });

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
