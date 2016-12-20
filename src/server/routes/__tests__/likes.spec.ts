/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';
import * as Express from 'express';

import createApp from '../../createApp';

import {userFactory, songFactory, uniqueString} from '../../__tests__/factories';

import {
  addSongToPlaylist,
  getPlaylistByUserId,
  getLikedEntriesByUserId,
} from '../../models/playlist';

const app = createApp();

describe('playlist routes', () => {
  describe('PUT /likes/:id', () => {
    it('likes an entry by id', async () => {
      const jeff = await userFactory();
      const dan = await userFactory();

      const song = await songFactory();
      await addSongToPlaylist({
        songId: song.id,
        userId: dan.id,
        youtubeUrl: uniqueString(),
        note: uniqueString(),
      });

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
