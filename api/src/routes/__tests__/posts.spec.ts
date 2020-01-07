import expect from 'expect';
import request from 'supertest';

import {
  userFactory,
  postFactory,
  songFactory,
} from '../../__tests__/factories';
import { postSong } from '../../models/post';
import { createAuthTokenForUserId } from '../../models/authTokens';
import { getPostsByUserId } from '../../models/playlists';

import createApp from '../../createApp';

const app = createApp();

function expectStatus(res: request.Response, status: number) {
  try {
    expect(res.status).toBe(status);
  } catch (err) {
    console.log(res.text);
    throw err;
  }
}

describe('routes/posts', () => {
  describe('POST /posts', () => {
    it('rejects a song that has already been posted by the current user', async () => {
      const user = await userFactory();
      const song = await songFactory();

      await postSong({ userId: user.id, songId: song.id });

      const req = request(app)
        .post('/api/posts')
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id))
        .send({
          spotifyId: song.spotifyId,
        });

      const res = await req;
      expectStatus(res, 400);
    });
  });

  describe('DELETE /posts/:id', () => {
    it('deletes a song', async () => {
      const user = await userFactory();
      const post = await postFactory({
        userId: user.id,
      });

      const beforePlaylist = await getPostsByUserId(user.id);
      expect(beforePlaylist.length).toBe(1);

      const req = request(app)
        .delete(`/api/posts/${post.songId}`)
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id));

      const res = await req;

      expectStatus(res, 200);

      const afterPlaylist = await getPostsByUserId(user.id);
      expect(afterPlaylist.length).toBe(0);
    });

    it("does not allow you to delete another user's song", async () => {
      const user = await userFactory();
      const post = await postFactory();

      const req = request(app)
        .delete(`/api/posts/${post.songId}`)
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id));

      const res = await req;

      expectStatus(res, 404);
    });

    it('returns 404 when a requested song does not exist', async () => {
      const user = await userFactory();

      const req = request(app)
        .delete('/api/playlist/42069')
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id));

      const res = await req;

      expectStatus(res, 404);
    });
  });
});
