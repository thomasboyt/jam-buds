/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';
import * as Express from 'express';

import {getUserByTwitterName} from '../../models/user';
import {getPlaylistByUserId} from '../../models/playlist';

import createApp from '../../createApp';

const app = createApp();

describe('playlist routes', () => {
  describe('POST /playlist', () => {
    it('creates a manually-entered song when manualEntry is true', async () => {
      const jeff = await getUserByTwitterName('jeffgerstmann');
      expect(jeff).toExist();

      const req = request(app)
        .post('/playlist')
        .set('X-Auth-Token', jeff!.authToken)
        .send({
          manualEntry: true,
          artist: 'Taeko Onuki',
          title: '4:00 AM',
          youtubeUrl: 'https://www.youtube.com/watch?v=YixAD9GIAuY'
        });

      const res: request.Response = await (req as any);

      try {
        expect(res.status).toBe(200);
      } catch(err) {
        console.log(res.text);
        throw err;
      }

      const playlist = await getPlaylistByUserId(jeff!.id);
      expect(playlist[0].artists[0]).toBe('Taeko Onuki');
      expect(playlist[0].title).toBe('4:00 AM');
    });
  });
});
