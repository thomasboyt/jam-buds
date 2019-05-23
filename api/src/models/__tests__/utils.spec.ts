import expect from 'expect';

import { db } from '../../db';
import { songFactory } from '../../__tests__/factories';
import { paginate } from '../utils';

describe('models/utils', () => {
  describe('pagination', () => {
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
