/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';

import createApp from '../../createApp';

import {
  userFactory,
  songFactory,
  uniqueString,
} from '../../__tests__/factories';

import {
  addSongToPlaylist,
  getLikedEntriesByUserId,
} from '../../models/playlist';

const app = createApp();

describe('routes/likes', () => {
  describe('PUT /likes/:id', () => {
    it('likes an entry by id', async () => {
      const jeff = await userFactory();
      const dan = await userFactory();

      const song = await songFactory();
      const entry = await addSongToPlaylist({
        songId: song.id,
        userId: dan.id,
        note: uniqueString(),
      });

      const req = request(app)
        .put(`/api/likes/${entry.id}`)
        .set('X-Auth-Token', jeff!.authToken);

      const res = await req;

      try {
        expect(res.status).toBe(200);
      } catch (err) {
        console.log(res.text);
        throw err;
      }

      const likes = await getLikedEntriesByUserId(jeff!.id, {
        currentUserId: jeff!.id,
      });
      expect(likes.length).toBe(1);
      expect(likes[0].id).toBe(entry.id);
      expect(likes[0].isLiked).toBe(true);
    });
  });
});
