import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

import { db } from '../db';
import { UserSongItem, Song } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { selectSongsQuery, serializeSong } from './song';
import { paginate } from './utils';

export const PostModelV = t.type({
  id: t.number,
  songId: t.number,
  userId: t.number,
  createdAt: dateType,
});

/**
 * The underlying `post` table.
 */
export type PostModel = t.TypeOf<typeof PostModelV>;

export interface PostSongParams {
  userId: number;
  songId: number;
}

export async function postSong(values: PostSongParams): Promise<Song> {
  await db!.insert(values).into('posts');

  const [row] = await selectSongsQuery(db!('songs'), {
    currentUserId: values.userId,
  }).where({ id: values.songId });

  return serializeSong(row);
}

function serializeUserSongItem(row: any): UserSongItem {
  const song = serializeSong(row);

  return {
    timestamp: row.timestamp.toISOString(),
    song: song,
  };
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
  afterTimestamp?: string;
}

export async function getPostedUserSongItemsById(
  userId: number,
  opts: QueryOptions = {}
): Promise<UserSongItem[]> {
  let query = selectSongsQuery(db!('posts'), opts)
    .select([db!.raw(`posts.created_at as timestamp`)])
    .join('users', { 'users.id': 'posts.user_id' })
    .join('songs', { 'songs.id': 'posts.song_id' })
    .where({ user_id: userId })
    .orderBy('posts.created_at', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'posts.created_at',
  });

  const rows = await query;

  return rows.map((row: any) => serializeUserSongItem(row));
}

interface GetOwnPostForSongIdOptions {
  userId: number;
  songId: number;
}

/**
 * Returns a raw `PostModel`.
 */
export async function getOwnPostForSongId(
  opts: GetOwnPostForSongIdOptions
): Promise<PostModel | null> {
  const query = db!('posts').where({
    songId: opts.songId,
    userId: opts.userId,
  });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return rows[0];
}

export async function deletePostById(id: number): Promise<void> {
  const query = db!('posts')
    .where({ id })
    .delete();

  await query;
}
