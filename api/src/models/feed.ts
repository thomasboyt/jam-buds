import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { FeedSongItem } from '../resources';
import { serializeSong, SongModelV, selectSongsQuery } from './song';
import validateOrThrow from '../util/validateOrThrow';

function serializeFeedSongItem(row: any): FeedSongItem {
  const { isLiked } = row;

  return {
    song: serializeSong(
      validateOrThrow(SongModelV, camelcaseKeys(row.song)),
      isLiked
    ),
    userNames: row.userNames,
    timestamp: row.timestamp.toISOString(),
  };
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<FeedSongItem[]> {
  opts.currentUserId = id;

  // XXX: This wacky subquery (which probably performs like ass) ensures that
  // the "timestamp" of a song that _you've_ posted is always set to the time
  // _you_ posted it.
  //
  // It's used in two places: first in the `select` statement to actually get
  // the timestamp in the resulting row, and second in the `where` statement to
  // filter for paguination. This is because Postgres does not support using an
  // aliased result column in a `where` clause:
  // https://stackoverflow.com/a/3241389
  const timestampQuery = `
    COALESCE(
      (
        SELECT posts.created_at FROM posts WHERE user_id=? AND song_id=songs.id
      ),
      MIN(posts.created_at)
    )
  `;

  let query = selectSongsQuery(db!('songs'), opts)
    .select([
      db!.raw(`${timestampQuery} as timestamp`, [opts.currentUserId]),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('posts', { 'songs.id': 'posts.song_id' })
    .join('users', { 'users.id': 'posts.user_id' })
    .where(function() {
      this.whereIn('user_id', function() {
        this.select('following_id')
          .from('following')
          .where({ user_id: id });
      }).orWhere({ user_id: id });
    })
    .groupBy('songs.id')
    .orderBy('timestamp', 'desc');

  if (opts.beforeTimestamp !== undefined) {
    query = query.havingRaw(`${timestampQuery} < ?`, [
      opts.currentUserId,
      opts.beforeTimestamp,
    ]);
  }

  query = query.limit(ENTRY_PAGE_LIMIT);

  const rows = await query;

  return rows.map((row: any) => serializeFeedSongItem(row));
}

export async function getPublicFeed(
  opts: QueryOptions = {}
): Promise<FeedSongItem[]> {
  let query = selectSongsQuery(db!('songs'), opts)
    .select([
      db!.raw(`MIN(posts.created_at) as timestamp`),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('posts', { 'songs.id': 'posts.song_id' })
    .join('users', { 'users.id': 'posts.user_id' })
    .where({ show_in_public_feed: true })
    .groupBy('songs.id')
    .orderBy('timestamp', 'desc');

  if (opts.beforeTimestamp !== undefined) {
    query = query.havingRaw(`MIN(posts.created_at) < ?`, [
      opts.beforeTimestamp,
    ]);
  }

  query = query.limit(ENTRY_PAGE_LIMIT);

  const rows = await query;

  return rows.map((row: any) => serializeFeedSongItem(row));
}
