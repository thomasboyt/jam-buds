import expect from 'expect';

import { db } from '../../db';
import {
  userFactory,
  postFactory,
  mixtapeFactory,
  songFactory,
} from '../../__tests__/factories';
import {
  getFeedByUserId,
  getPublicFeed,
  getLikesByUserId,
  getPostsByUserId,
  paginate,
} from '../playlists';
import { UserModel, setUserFeedToPublic } from '../user';
import { followUser } from '../following';
import { getOwnPostForSongId, PostModel } from '../post';
import { PlaylistSongItem, PlaylistMixtapeItem } from '../../resources';
import { createLike } from '../like';

describe('models/playlists', () => {
  describe('getFeedByUserId', () => {
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
      const items = (await getFeedByUserId(jeff.id)) as PlaylistSongItem[];
      expect(items.length).toBe(2);

      const ids = items.map((item) => item.song.id);
      expect(ids).toContain(vinnyPost.songId);
      expect(ids).toContain(jeffPost.songId);
    });

    it('returns items in reverse-chronological order', async () => {
      await followUser(jeff.id, dan.id);
      const items = (await getFeedByUserId(jeff.id)) as PlaylistSongItem[];

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

      const items = (await getFeedByUserId(jeff.id)) as PlaylistSongItem[];

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
      const item = items[0] as PlaylistSongItem;
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
      const entry = items[0] as PlaylistMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(dan.name);
    });
  });

  describe('getPublicFeed', () => {
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
      const item = items[0] as PlaylistSongItem;
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
      const entry = items[0] as PlaylistMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(vinny.name);
    });
  });

  describe('getLikesByUserId', () => {
    it("returns a user's liked songs", async () => {
      const user = await userFactory();
      const { id } = await songFactory();
      await createLike({ userId: user.id, songId: id });

      const items = await getLikesByUserId(user.id, { currentUserId: user.id });
      expect(items.length).toBe(1);
      expect(items[0].song.id).toBe(id);
    });
  });

  describe('getPostsByUserId', () => {
    it('includes published mixtapes', async () => {
      const user = await userFactory();
      await mixtapeFactory(user);

      const items = await getPostsByUserId(user.id);

      expect(items.length).toBe(1);
      expect(items[0].type).toBe('mixtape');
      const entry = items[0] as PlaylistMixtapeItem;
      expect(entry.mixtape.title).toBe('test mixtape');
      expect(entry.mixtape.authorName).toBe(user.name);
    });
  });

  describe('paginate', () => {
    beforeEach(async () => {
      for (let i = 0; i < 40; i += 1) {
        await songFactory();
      }
    });

    it('respects passed limit', async () => {
      const songQuery = db!('songs');
      const rows = await paginate(songQuery, {
        limit: 5,
        columnName: 'id',
      }).orderBy('id', 'desc');
      expect(rows.length).toBe(5);
    });

    it('starts at offset specified', async () => {
      const songQuery = db!('songs');

      const newestSong = (await songQuery.orderBy('id', 'desc').limit(1))[0];
      const lastId = newestSong.id;

      const query = paginate(songQuery, {
        limit: 5,
        columnName: 'id',
        before: lastId,
      }).orderBy('id', 'desc');

      const rows = await query;
      expect(rows[0].id).toBe(lastId - 1);
      expect(rows[1].id).toBe(lastId - 2);
      expect(rows[2].id).toBe(lastId - 3);
      expect(rows[3].id).toBe(lastId - 4);
      expect(rows[4].id).toBe(lastId - 5);
    });
  });
});
