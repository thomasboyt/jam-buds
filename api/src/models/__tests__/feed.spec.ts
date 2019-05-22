import expect from 'expect';

import { userFactory, postFactory } from '../../__tests__/factories';
import { getFeedByUserId } from '../feed';
import { UserModel } from '../user';
import { followUser } from '../following';
import { PlaylistEntry } from '../../resources';

import { db } from '../../db';

async function setEntryCreated(id: number, createdAt: string) {
  await db!('posts')
    .where({ id })
    .update({
      created_at: createdAt,
    });
}

describe('models/feed', () => {
  describe('querying the feed', () => {
    let jeff: UserModel;
    let vinny: UserModel;
    let dan: UserModel;
    let jeffEntry: PlaylistEntry;
    let vinnyEntry: PlaylistEntry;
    let danEntry: PlaylistEntry;

    beforeEach(async () => {
      jeff = await userFactory();
      vinny = await userFactory();
      dan = await userFactory();

      await followUser(jeff.id, vinny.id);

      jeffEntry = await postFactory({ userId: jeff.id });
      await setEntryCreated(jeffEntry.id, '2016-11-01T00:04:03.059656-05:00');

      vinnyEntry = await postFactory({ userId: vinny.id });
      await setEntryCreated(vinnyEntry.id, '2016-12-01T00:04:03.059656-05:00');

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
      expect(items[1].postedBy).toInclude(dan.name);
      expect(items[1].postedBy).toInclude(vinny.name);
    });
  });
});
