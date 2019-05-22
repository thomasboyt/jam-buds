import expect from 'expect';
import request from 'supertest';

import { userFactory, postFactory } from '../../__tests__/factories';
import { getPlaylistEntriesByUserId } from '../../models/post';

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
  // describe('POST /posts', () => {
  //   it('creates a manually-entered song when manualEntry is true', async () => {
  //     const user = await userFactory();

  //     const req = request(app)
  //       .post('/api/playlist')
  //       .set('X-Auth-Token', user.authToken)
  //       .send({
  //         manualEntry: true,
  //         artist: 'Taeko Onuki',
  //         title: '4:00 AM',
  //         youtubeUrl: 'https://www.youtube.com/watch?v=YixAD9GIAuY',
  //         source: 'youtube',
  //       });

  //     const res = await req;

  //     expectStatus(res, 200);

  //     const playlist = await getPlaylistByUserId(user.id);
  //     expect(playlist[0].song.artists[0]).toBe('Taeko Onuki');
  //     expect(playlist[0].song.title).toBe('4:00 AM');
  //   });
  // });

  describe('DELETE /posts/:id', () => {
    it('deletes a song', async () => {
      const user = await userFactory();
      const entry = await postFactory({
        userId: user.id,
      });

      const beforePlaylist = await getPlaylistEntriesByUserId(user.id);
      expect(beforePlaylist.length).toBe(1);

      const req = request(app)
        .delete(`/api/posts/${entry.song.id}`)
        .set('X-Auth-Token', user.authToken);

      const res = await req;

      expectStatus(res, 200);

      const afterPlaylist = await getPlaylistEntriesByUserId(user.id);
      expect(afterPlaylist.length).toBe(0);
    });

    it("does not allow you to delete another user's song", async () => {
      const user = await userFactory();
      const entry = await postFactory();

      const req = request(app)
        .delete(`/api/posts/${entry.song.id}`)
        .set('X-Auth-Token', user.authToken);

      const res = await req;

      expectStatus(res, 404);
    });

    it('returns 404 when a requested song does not exist', async () => {
      const user = await userFactory();

      const req = request(app)
        .delete('/api/playlist/42069')
        .set('X-Auth-Token', user.authToken);

      const res = await req;

      expectStatus(res, 404);
    });
  });
});
