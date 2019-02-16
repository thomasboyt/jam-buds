import expect from 'expect';
import request from 'supertest';

import { userFactory, postFactory } from '../../__tests__/factories';

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
});
