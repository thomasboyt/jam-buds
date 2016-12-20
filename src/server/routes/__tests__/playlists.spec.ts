/// <reference types="mocha" />

import * as expect from 'expect';
import * as request from 'supertest';
import * as Express from 'express';

import {userFactory, entryFactory} from '../../__tests__/factories';
import {getPlaylistByUserId, addSongToPlaylist} from '../../models/playlist';

import createApp from '../../createApp';

const app = createApp();

function expectStatus(res: request.Response, status: number) {
  try {
    expect(res.status).toBe(status);
  } catch(err) {
    console.log(res.text);
    throw err;
  }
}

describe('routes/playlists', () => {
  describe('POST /playlist', () => {
    it('creates a manually-entered song when manualEntry is true', async () => {
      const user = await userFactory();

      const req = request(app)
        .post('/playlist')
        .set('X-Auth-Token', user.authToken)
        .send({
          manualEntry: true,
          artist: 'Taeko Onuki',
          title: '4:00 AM',
          youtubeUrl: 'https://www.youtube.com/watch?v=YixAD9GIAuY'
        });

      const res: request.Response = await (req as any);

      expectStatus(res, 200);

      const playlist = await getPlaylistByUserId(user.id);
      expect(playlist[0].song.artists[0]).toBe('Taeko Onuki');
      expect(playlist[0].song.title).toBe('4:00 AM');
    });
  });

  describe('DELETE /playlist/:id', () => {
    it('deletes a song', async () => {
      const user = await userFactory();
      const entry = await entryFactory({
        userId: user.id,
      });

      const beforePlaylist = await getPlaylistByUserId(user.id);
      expect(beforePlaylist.length).toBe(1);

      const req = request(app)
        .delete(`/playlist/${entry.id}`)
        .set('X-Auth-Token', user.authToken);

      const res: request.Response = await (req as any);

      expectStatus(res, 200);

      const afterPlaylist = await getPlaylistByUserId(user.id);
      expect(afterPlaylist.length).toBe(0);
    });

    it('does not allow you to delete another user\'s song', async () => {
      const user = await userFactory();
      const entry = await entryFactory();

      const req = request(app)
        .delete(`/playlist/${entry.id}`)
        .set('X-Auth-Token', user.authToken);

      const res: request.Response = await (req as any);

      expectStatus(res, 400);
    });

    it('returns 404 when a requested song does not exist', async () => {
      const user = await userFactory();

      const req = request(app)
        .delete('/playlist/42069')
        .set('X-Auth-Token', user.authToken);

      const res: request.Response = await (req as any);

      expectStatus(res, 404);
    });
  });
});
