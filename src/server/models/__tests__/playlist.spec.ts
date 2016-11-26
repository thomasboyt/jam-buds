/// <reference types="mocha" />

import * as expect from 'expect';
import * as playlist from '../playlist';

import {db} from '../../db';

describe('playlist model', () => {
  describe('getFeedByUserId', () => {
    it('only returns items in a user\'s following list', async () => {
      const items = await playlist.getFeedByUserId(1);
      expect(items.length).toBe(2);

      // TODO: when this function is updated to return the ID of the user who added it,
      // assert that that is in the user's friends list
    });
  });
});
