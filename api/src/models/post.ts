import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';
import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { PlaylistEntry } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { joinSongsQuery, serializeSong, SongModelV } from './song';
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

  const [id] = await query;
  const post = await getPlaylistEntryById(id);

  return post!;
}

function serializePlaylistEntry(row: any): PlaylistEntry {
  const { isLiked } = row;
  const post = validateOrThrow(
    PostModelV,
    camelcaseKeys({
      ...row.post,
      // XXX: okay, so, this is really weird, but: `createdAt` gets converted
      // into a string when to_json() is used to namespace the table, because
      // the to_json solution is a completely garbage hack that should die in a
      // fire. This is the worst.
      createdAt: new Date(row.post.created_at),
    })
  );
  const song = serializeSong(
    validateOrThrow(SongModelV, camelcaseKeys(row.song)),
    isLiked
  );

  return {
    postedAt: post.createdAt.toISOString(),
    song: song,
    id: post.id,
  };
}

interface QueryOptions {
  currentUserId?: number;
  previousId?: number;
}

function getBasePostsQuery(opts: QueryOptions) {
  /*
   * Note: the db!.raw('to_json') calls are used to "namespace" the results here
   * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
   * This may not be a great idea performance-wise.
   */

  let query = db!('posts')
    .select(db!.raw('to_json(posts.*) as post'))
    .join('users', {
      'users.id': 'posts.user_id',
    });

  return paginate(joinSongsQuery(query, opts), {
    limit: ENTRY_PAGE_LIMIT,
    previousId: opts.previousId,
    idColumn: 'posts.id',
  }).join('songs', {
    'songs.id': 'posts.song_id',
  });
}

export async function getPlaylistEntriesByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry[]> {
  const query = getBasePostsQuery(opts)
    .where({ user_id: id })
    .orderBy('posts.id', 'desc');

  const rows = await query;

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getPlaylistEntryById(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry | null> {
  const query = getBasePostsQuery(opts).where({ 'posts.id': id });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return serializePlaylistEntry(rows[0]);
}

/**
 * Returns a raw `PostModel`.
 */
export async function getPostById(id: number): Promise<PostModel | null> {
  const query = db!('posts').where({ id });

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
