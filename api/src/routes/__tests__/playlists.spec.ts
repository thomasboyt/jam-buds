import expect from 'expect';
import request from 'supertest';

import { userFactory, postFactory } from '../../__tests__/factories';
import { createAuthTokenForUserId } from '../../models/authTokens';

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
    it('supports pagination', async function() {
      const user = await userFactory();

      for (let i = 0; i < 40; i += 1) {
        await postFactory({ userId: user.id });
      }

      const firstPageReq = request(app)
        .get(`/api/playlists/${user.name}`)
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id));

      // TODO: Assert that these are the newest 20 items
      const firstPageRes = await firstPageReq;

      expectStatus(firstPageRes, 200);

      const lastTimestampFirstPage = firstPageRes.body.tracks.slice(-1)[0]
        .timestamp;

      const secondPageReq = request(app)
        .get(`/api/playlists/${user.name}`)
        .set('X-Auth-Token', await createAuthTokenForUserId(user.id))
        .query({
          before: lastTimestampFirstPage,
        });

      const secondPageRes = await secondPageReq;

      expectStatus(secondPageRes, 200);

      // TODO: Assert that these are the next 20 items
      const lastTimestampSecondPage = secondPageRes.body.tracks.slice(-1)[0]
        .timestamp;
      expect(new Date(lastTimestampSecondPage).valueOf()).toBeLessThan(
        new Date(lastTimestampFirstPage).valueOf()
      );
    });
  });
});
