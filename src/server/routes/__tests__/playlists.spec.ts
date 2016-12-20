/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';
import * as Express from 'express';

import {userFactory} from '../../__tests__/factories';
import {createSongFromManualEntry} from '../../models/song';
import {getPlaylistByUserId, addSongToPlaylist} from '../../models/playlist';

import createApp from '../../createApp';

const app = createApp();

describe('playlist routes', () => {
  describe('POST /playlist', () => {
    it('creates a manually-entered song when manualEntry is true', async () => {
      const jeff = await userFactory();

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
      expect(playlist[0].song.artists[0]).toBe('Taeko Onuki');
      expect(playlist[0].song.title).toBe('4:00 AM');
    });
  });
});
