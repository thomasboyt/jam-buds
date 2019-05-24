import expect from 'expect';

import {
  userFactory,
  postFactory,
  PlaylistEntryWithPostId,
} from '../../__tests__/factories';
import { getFeedByUserId } from '../feed';
import { UserModel } from '../user';
import { followUser } from '../following';

import { getOwnPostForSongId } from '../post';

describe('models/feed', () => {
  describe('querying the feed', () => {
    let jeff: UserModel;
    let vinny: UserModel;
    let dan: UserModel;
    let jeffEntry: PlaylistEntryWithPostId;
    let vinnyEntry: PlaylistEntryWithPostId;
    let danEntry: PlaylistEntryWithPostId;

    beforeEach(async () => {
      jeff = await userFactory();
      vinny = await userFactory();
      dan = await userFactory();

      await followUser(jeff.id, vinny.id);

      jeffEntry = await postFactory({ userId: jeff.id });
      vinnyEntry = await postFactory({ userId: vinny.id });
      danEntry = await postFactory({ userId: dan.id });
    });

    it("only returns items in a user's following list, plus their own entries", async () => {
      const items = await getFeedByUserId(jeff.id);
      expect(items.length).toBe(2);

      const ids = items.map((item) => item.song.id);
      expect(ids).toContain(vinnyEntry.song.id);
      expect(ids).toContain(jeffEntry.song.id);
    });

    it('returns items in reverse-chronological order', async () => {
      await followUser(jeff.id, dan.id);
      const items = await getFeedByUserId(jeff.id);

      expect(items.length).toBe(3);
      expect(items[0].song.id).toBe(danEntry.song.id);
      expect(items[1].song.id).toBe(vinnyEntry.song.id);
      expect(items[2].song.id).toBe(jeffEntry.song.id);
    });

    it('aggregates songs posted by multiple users', async () => {
      await followUser(jeff.id, dan.id);
      await postFactory({
        userId: dan.id,
        songId: vinnyEntry.song.id,
      });

      const items = await getFeedByUserId(jeff.id);

      expect(items.length).toBe(3);
      expect(items[1].song.id).toBe(vinnyEntry.song.id);
      expect(items[1].userNames).toInclude(dan.name);
      expect(items[1].userNames).toInclude(vinny.name);
    });

    it('uses the time the current user posted a song as an aggregated entry timestamp', async () => {
      await followUser(jeff.id, dan.id);

      const dupEntry = await postFactory({
        userId: jeff.id,
        songId: vinnyEntry.song.id,
      });

      const post = await getOwnPostForSongId({
        songId: dupEntry.song.id,
        userId: jeff.id,
      });

      const items = await getFeedByUserId(jeff.id);

      expect(items.length).toBe(3);
      expect(items[0].song.id).toBe(vinnyEntry.song.id);
      expect(items[0].timestamp).toBe(post!.createdAt.toISOString());
    });
  });
});
