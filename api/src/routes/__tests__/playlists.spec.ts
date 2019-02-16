import expect from 'expect';
import request from 'supertest';

import { userFactory, postFactory } from '../../__tests__/factories';
import { getPostsByUserId } from '../../models/post';

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

describe('routes/playlists', () => {
  describe('GET /playlists/:name', () => {
    it('supports pagination', async () => {
      const user = await userFactory();

      for (let i = 0; i < 100; i += 1) {
        await postFactory({ userId: user.id });
      }

      const firstPageReq = request(app)
        .get(`/api/playlists/${user.name}`)
        .set('X-Auth-Token', user.authToken);

      // TODO: Assert that these are the newest 20 items
      const firstPageRes = await firstPageReq;

      expectStatus(firstPageRes, 200);

      const previousId = firstPageRes.body.tracks.slice(-1)[0].id;
      console.log(firstPageRes.body.tracks.map((track: any) => track.id));

      const secondPageReq = request(app)
        .get(`/api/playlists/${user.name}`)
        .set('X-Auth-Token', user.authToken)
        .query({
          previousId,
        });

      const secondPageRes = await secondPageReq;

      expectStatus(secondPageRes, 200);

      // TODO: Assert that these are the next 20 items
      const nextId = secondPageRes.body.tracks[0].id;
      expect(nextId).toBeLessThan(previousId);
    });
  });

  describe('POST /playlist', () => {
    /*
    it('creates a manually-entered song when manualEntry is true', async () => {
      const user = await userFactory();

      const req = request(app)
        .post('/api/playlist')
        .set('X-Auth-Token', user.authToken)
        .send({
          manualEntry: true,
          artist: 'Taeko Onuki',
          title: '4:00 AM',
          youtubeUrl: 'https://www.youtube.com/watch?v=YixAD9GIAuY',
          source: 'youtube',
        });

      const res = await req;

      expectStatus(res, 200);

      const playlist = await getPlaylistByUserId(user.id);
      expect(playlist[0].song.artists[0]).toBe('Taeko Onuki');
      expect(playlist[0].song.title).toBe('4:00 AM');
    });
    */
  });

  describe('DELETE /playlist/:id', () => {
    it('deletes a song', async () => {
      const user = await userFactory();
      const entry = await postFactory({
        userId: user.id,
      });

      const beforePlaylist = await getPostsByUserId(user.id);
      expect(beforePlaylist.length).toBe(1);

      const req = request(app)
        .delete(`/api/playlist/${entry.id}`)
        .set('X-Auth-Token', user.authToken);

      const res = await req;

      expectStatus(res, 200);

      const afterPlaylist = await getPostsByUserId(user.id);
      expect(afterPlaylist.length).toBe(0);
    });

    it("does not allow you to delete another user's song", async () => {
      const user = await userFactory();
      const entry = await postFactory();

      const req = request(app)
        .delete(`/api/playlist/${entry.id}`)
        .set('X-Auth-Token', user.authToken);

      const res = await req;

      expectStatus(res, 400);
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
