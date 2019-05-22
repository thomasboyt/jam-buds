import expect from 'expect';

import { userFactory, postFactory } from '../../__tests__/factories';
import { getPlaylistEntryById, deletePostById } from '../post';

describe('models/post', () => {
  describe('deleteEntryById', () => {
    it('deletes a posted entry', async () => {
      const user = await userFactory();
      const entry = await postFactory({ userId: user.id });

      await deletePostById(entry.id);

      expect(await getPlaylistEntryById(entry.id)).toNotExist();
    });
  });
});
