import expect from 'expect';
import request from 'supertest';

import createApp from '../../createApp';

import {
  userFactory,
  songFactory,
  uniqueString,
} from '../../__tests__/factories';

import { createPost } from '../../models/post';
import { getLikesByUserId } from '../../models/like';

const app = createApp();

describe('routes/likes', () => {
  describe('PUT /likes/:id', () => {
    it('likes a song by id', async () => {
      const jeff = await userFactory();
      const dan = await userFactory();

      const song = await songFactory();
      const post = await createPost({
        songId: song.id,
        userId: dan.id,
      });

      const req = request(app)
        .put(`/api/likes/${post.song.id}`)
        .set('X-Auth-Token', jeff!.authToken);

      const res = await req;

      try {
        expect(res.status).toBe(200);
      } catch (err) {
        console.log(res.text);
        throw err;
      }

      const likes = await getLikesByUserId(jeff!.id, {
        currentUserId: jeff!.id,
      });
      expect(likes.length).toBe(1);
      expect(likes[0].song.id).toBe(song.id);
      expect(likes[0].song.isLiked).toBe(true);
    });
  });
});
