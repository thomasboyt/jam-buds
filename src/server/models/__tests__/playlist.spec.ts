/// <reference types="mocha" />

import * as expect from 'expect';
import * as playlist from '../playlist';

import {db} from '../../db';

describe('playlist model', () => {
  describe('getFeedByUserId', () => {
    it('only returns items in a user\'s following list', async () => {
      const items = await playlist.getFeedByUserId(1);
      expect(items.length).toBe(2);

      const userIds = items.map((item) => item.user.id);
      expect(userIds).toContain(2);
      expect(userIds).toContain(4);
    });
  });
});
