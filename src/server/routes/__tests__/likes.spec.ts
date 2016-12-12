/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';
import * as Express from 'express';

import createApp from '../../createApp';

import {getUserByTwitterName} from '../../models/user';
import {getPlaylistByUserId, getLikedEntriesByUserId} from '../../models/playlist';

const app = createApp();

describe('playlist routes', () => {
  describe('PUT /likes/:id', () => {
    it('likes an entry by id', async () => {
      const jeff = await getUserByTwitterName('jeffgerstmann');

      const req = request(app)
        .put('/likes/1')
        .set('X-Auth-Token', jeff!.authToken);

      const res: request.Response = await (req as any);

      try {
        expect(res.status).toBe(200);
      } catch(err) {
        console.log(res.text);
        throw err;
      }

      const likes = await getLikedEntriesByUserId(jeff!.id, jeff!.id);
      expect(likes.length).toBe(1);
      expect(likes[0].id).toBe(1);
      expect(likes[0].isLiked).toBe(true);
    });
  });
});
