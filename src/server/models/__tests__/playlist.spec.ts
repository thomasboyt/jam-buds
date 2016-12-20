/// <reference types="mocha" />

import * as expect from 'expect';
import * as playlist from '../playlist';

import {userFactory, entryFactory} from '../../__tests__/factories';
import {User} from '../../models/User';
import {getPlaylistByUserId, addSongToPlaylist, likePlaylistEntry} from '../../models/playlist';
import {followUser} from '../../models/following';
import {PlaylistEntry} from '../../../universal/resources';

import {db} from '../../db';

describe('models/playlist', () => {
  let jeff: User;
  let vinny: User;
  let dan: User;
  let jeffEntry: PlaylistEntry;
  let vinnyEntry: PlaylistEntry;
  let danEntry: PlaylistEntry;

  beforeEach(async () => {
    jeff = await userFactory();
    vinny = await userFactory();
    dan = await userFactory();

    await followUser(jeff.id, vinny.id);

    jeffEntry = await entryFactory({userId: jeff.id});
    vinnyEntry = await entryFactory({userId: vinny.id});

    await (db!('playlist_entries').where({id: vinnyEntry.id}).update({
      created_at: '2016-12-01T00:04:03.059656-05:00'
    }) as any);

    danEntry = await entryFactory({userId: dan.id});
  });

  describe('getFeedByUserId', () => {
    it('only returns items in a user\'s following list', async () => {
      const items = await playlist.getFeedByUserId(jeff.id);
      expect(items.length).toBe(1);
      expect(items[0].user.id).toBe(vinny.id);
    });

    it('returns items in reverse-chronological order', async () => {
      await followUser(jeff.id, dan.id);
      const items = await playlist.getFeedByUserId(jeff.id);

      expect(items.length).toBe(2);
      expect(items[0].id).toBe(danEntry.id);
      expect(items[1].id).toBe(vinnyEntry.id);
    });
  });

  describe('getLikedEntriesByUserId', () => {
    it('returns a user\'s liked entries', async () => {
      await likePlaylistEntry(jeff.id, danEntry.id);

      const items = await playlist.getLikedEntriesByUserId(jeff.id);
      expect(items.length).toBe(1);
      expect(items[0].id).toBe(danEntry.id);
    });
  });
});
