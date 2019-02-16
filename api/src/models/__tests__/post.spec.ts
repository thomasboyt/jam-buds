import expect from 'expect';

import { userFactory, postFactory } from '../../__tests__/factories';
import * as playlist from '../post';
import { User } from '../user';
import { getPostById, deletePostById } from '../post';
import { followUser } from '../following';
import { Post } from '../../resources';

import { db } from '../../db';

async function setEntryCreated(id: number, createdAt: string) {
  await db!('posts')
    .where({ id })
    .update({
      created_at: createdAt,
    });
}

describe('models/post', () => {
  describe('querying', () => {
    let jeff: User;
    let vinny: User;
    let dan: User;
    let jeffEntry: Post;
    let vinnyEntry: Post;
    let danEntry: Post;

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

    describe('getFeedByUserId', () => {
      it("only returns items in a user's following list, plus their own entries", async () => {
        const items = await playlist.getFeedByUserId(jeff.id);
        expect(items.length).toBe(2);

        const ids = items.map((item) => item.id);
        expect(ids).toContain(vinnyEntry.id);
        expect(ids).toContain(jeffEntry.id);
      });

      it('returns items in reverse-chronological order', async () => {
        await followUser(jeff.id, dan.id);
        const items = await playlist.getFeedByUserId(jeff.id);

        expect(items.length).toBe(3);
        expect(items[0].id).toBe(danEntry.id);
        expect(items[1].id).toBe(vinnyEntry.id);
        expect(items[2].id).toBe(jeffEntry.id);
      });
    });
  });

  describe('deleteEntryById', () => {
    it('deletes a posted entry', async () => {
      const user = await userFactory();
      const entry = await postFactory({ userId: user.id });

      await deletePostById(entry.id);

      expect(await getPostById(entry.id)).toNotExist();
    });
  });
});
