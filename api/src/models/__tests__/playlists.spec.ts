import expect from 'expect';

import { db } from '../../db';
import { userFactory, songFactory } from '../../__tests__/factories';
import { getLikesByUserId, paginate } from '../playlists';
import { createLike } from '../like';

describe('models/playlists', () => {
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

  describe('paginate', () => {
    beforeEach(async () => {
      for (let i = 0; i < 40; i += 1) {
        await songFactory();
      }
    });

    it('respects passed limit', async () => {
      const songQuery = db!('songs');
      const rows = await paginate(songQuery, {
        limit: 5,
        columnName: 'id',
      }).orderBy('id', 'desc');
      expect(rows.length).toBe(5);
    });

    it('starts at offset specified', async () => {
      const songQuery = db!('songs');

      const newestSong = (await songQuery.orderBy('id', 'desc').limit(1))[0];
      const lastId = newestSong.id;

      const query = paginate(songQuery, {
        limit: 5,
        columnName: 'id',
        before: lastId,
      }).orderBy('id', 'desc');

      const rows = await query;
      expect(rows[0].id).toBe(lastId - 1);
      expect(rows[1].id).toBe(lastId - 2);
      expect(rows[2].id).toBe(lastId - 3);
      expect(rows[3].id).toBe(lastId - 4);
      expect(rows[4].id).toBe(lastId - 5);
    });
  });
});
