import expect from 'expect';

import {
  userFactory,
  postFactory,
  mixtapeFactory,
} from '../../__tests__/factories';
import { getFeedByUserId, getPublicFeed } from '../feed';
import { UserModel, setUserFeedToPublic } from '../user';
import { followUser } from '../following';
import { getOwnPostForSongId, PostModel } from '../post';
import { PostListSongItem, PostListMixtapeItem } from '../../resources';

describe('models/feed', () => {
  describe('querying the feed', () => {
    let jeff: UserModel;
    let vinny: UserModel;
    let dan: UserModel;
    let jeffPost: PostModel;
    let vinnyPost: PostModel;
    let danPost: PostModel;

    beforeEach(async () => {
      jeff = await userFactory();
      vinny = await userFactory();
      dan = await userFactory();

      await followUser(jeff.id, vinny.id);

      jeffPost = await postFactory({ userId: jeff.id });
      vinnyPost = await postFactory({ userId: vinny.id });
      danPost = await postFactory({ userId: dan.id });
    });

    it("only returns items in a user's following list, plus their own entries", async () => {
      const items = (await getFeedByUserId(jeff.id)) as PostListSongItem[];
      expect(items.length).toBe(2);

      const ids = items.map((item) => item.song.id);
      expect(ids).toContain(vinnyPost.songId);
      expect(ids).toContain(jeffPost.songId);
    });

    it('returns items in reverse-chronological order', async () => {
      await followUser(jeff.id, dan.id);
      const items = (await getFeedByUserId(jeff.id)) as PostListSongItem[];

      expect(items.length).toBe(3);
      expect(items[0].song.id).toBe(danPost.songId);
      expect(items[1].song.id).toBe(vinnyPost.songId);
      expect(items[2].song.id).toBe(jeffPost.songId);
    });

    it('aggregates songs posted by multiple users', async () => {
      await followUser(jeff.id, dan.id);
      await postFactory({
        userId: dan.id,
        songId: vinnyPost.songId,
      });

      const items = (await getFeedByUserId(jeff.id)) as PostListSongItem[];

      expect(items.length).toBe(3);
      expect(items[1].song.id).toBe(vinnyPost.songId);
      expect(items[1].userNames).toContain(dan.name);
      expect(items[1].userNames).toContain(vinny.name);
    });

    it('uses the time the current user posted a song as an aggregated entry timestamp', async () => {
      await followUser(jeff.id, dan.id);

      const dupPost = await postFactory({
        userId: jeff.id,
        songId: vinnyPost.songId,
      });

      const post = await getOwnPostForSongId({
        songId: dupPost.songId,
        userId: jeff.id,
      });

      const items = await getFeedByUserId(jeff.id);

      expect(items.length).toBe(3);
      const item = items[0] as PostListSongItem;
      expect(item.type).toBe('song');
      expect(item.song.id).toBe(vinnyPost.songId);
      expect(item.timestamp).toBe(post!.createdAt.toISOString());
    });

    it('displays mixtapes in the feed', async () => {
      await mixtapeFactory(dan);
      await followUser(jeff.id, dan.id);
      const items = await getFeedByUserId(jeff.id);

      expect(items.length).toBe(4);
      expect(items[0].type).toBe('mixtape');
      const entry = items[0] as PostListMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(dan.name);
    });
  });

  describe('querying the public feed', () => {
    let jeff: UserModel;
    let vinny: UserModel;

    beforeEach(async () => {
      jeff = await userFactory();
      vinny = await userFactory();
    });

    it('only shows posts from users with public feed enabled', async () => {
      await setUserFeedToPublic(vinny);

      await postFactory({
        userId: jeff.id,
      });

      const vinPost = await postFactory({
        userId: vinny.id,
      });

      const items = await getPublicFeed();

      expect(items.length).toBe(1);
      const item = items[0] as PostListSongItem;
      expect(item.type).toBe('song');
      expect(item.song.id).toBe(vinPost.songId);
    });

    it('includes mixtapes from public users', async () => {
      await setUserFeedToPublic(vinny);
      await mixtapeFactory(vinny);
      await mixtapeFactory(jeff);

      const items = await getPublicFeed();

      expect(items.length).toBe(1);
      expect(items[0].type).toBe('mixtape');
      const entry = items[0] as PostListMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(vinny.name);
    });
  });
});
