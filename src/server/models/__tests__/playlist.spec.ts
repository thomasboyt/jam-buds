/// <reference types="mocha" />

import * as expect from 'expect';
import * as playlist from '../playlist';

import {db} from '../../db';

// TODO: Instead of relying on seed data, set up data here

describe('playlist model', () => {
  describe('getFeedByUserId', () => {
    it('only returns items in a user\'s following list', async () => {
      const items = await playlist.getFeedByUserId(1);
      expect(items.length).toBe(2);

      const userIds = items.map((item) => item.user.id);
      expect(userIds).toContain(2);
      expect(userIds).toContain(4);
    });

    it('returns items in chronological order', async () => {
      const items = await playlist.getFeedByUserId(1);

      expect(items[0].song.title).toBe('Drive');
      expect(items[1].song.title).toBe('Free Bird');
    });
  });
});
