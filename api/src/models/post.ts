import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';
import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { PlaylistEntry } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { selectSongsQuery, serializeSong, SongModelV } from './song';
import { paginate } from './utils';
import validateOrThrow from '../util/validateOrThrow';

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

export async function postSong(values: PostSongParams): Promise<PlaylistEntry> {
  const query = db!
    .insert(values)
    .into('posts')
    .returning('id');

  await query;

  const entry = await getPlaylistEntryBySongId(
    values.songId,
    values.userId,
    values.userId
  );

  return entry!;
}

function serializePlaylistEntry(row: any): PlaylistEntry {
  const { isLiked } = row;
  const song = serializeSong(
    validateOrThrow(SongModelV, camelcaseKeys(row.song)),
    isLiked
  );

  return {
    timestamp: row.timestamp.toISOString(),
    song: song,
    userNames: [row.userName],
  };
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
}

/**
 * A playlist entry requires a variety of stuff to get up and running:
 *
 * - song ID (to filter by)
 * - current user ID (for `isLiked`)
 * - playlist user ID (to get post by)
 *
 * The differences between this resource and the one returned by the feed
 * queries is are:
 *
 * - timestamp is just set to whatever the playlist user ID's post was.
 * - the [userNames] array is just set to be the playlist user's name
 */
function getBasePostsQuery(opts: QueryOptions) {
  let query = selectSongsQuery(db!('posts'), opts)
    .select([
      db!.raw(`users.name as user_name`),
      db!.raw(`posts.created_at as timestamp`),
    ])
    .join('users', { 'users.id': 'posts.user_id' })
    .join('songs', { 'songs.id': 'posts.song_id' });

  return query;
}

export async function getPlaylistEntriesByUserId(
  userId: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry[]> {
  let query = getBasePostsQuery(opts)
    .where({ user_id: userId })
    .orderBy('posts.id', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    columnName: 'posts.created_at',
  });

  const rows = await query;

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getPlaylistEntryBySongId(
  songId: number,
  playlistUserId: number,
  currentUserId: number
): Promise<PlaylistEntry | null> {
  const query = getBasePostsQuery({ currentUserId }).where({
    song_id: songId,
    user_id: playlistUserId,
  });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return serializePlaylistEntry(rows[0]);
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
