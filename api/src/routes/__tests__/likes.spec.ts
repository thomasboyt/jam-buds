import expect from 'expect';
import request from 'supertest';

import createApp from '../../createApp';

import { userFactory, songFactory } from '../../__tests__/factories';

import { postSong } from '../../models/post';
import { getLikesByUserId } from '../../models/playlists';
import { createAuthTokenForUserId } from '../../models/authTokens';
import { PlaylistSongItem } from '../../resources';

const app = createApp();

describe('routes/likes', () => {
  describe('PUT /likes/:id', () => {
    it('likes a song by id', async () => {
      const jeff = await userFactory();
      const dan = await userFactory();

      const song = await songFactory();
      await postSong({
        songId: song.id,
        userId: dan.id,
      });

      const req = request(app)
        .put(`/api/likes/${song.id}`)
        .set('X-Auth-Token', await createAuthTokenForUserId(jeff.id));

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
      const like = likes[0];
      expect(like.type).toBe('song');
      expect((like as PlaylistSongItem).song.id).toBe(song.id);
      expect((like as PlaylistSongItem).song.isLiked).toBe(true);
    });
  });
});
