import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { PlaylistEntry } from '../resources';
import { serializeSong, SongModelV, selectSongsQuery } from './song';
import validateOrThrow from '../util/validateOrThrow';

function serializeFeedEntry(row: any): PlaylistEntry {
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
): Promise<PlaylistEntry[]> {
  opts.currentUserId = id;

  let query = selectSongsQuery(db!('songs'), opts)
    .select([
      // This wacky subquery (which probably performs like ass) ensures that the
      // "timestamp" of a song that _you've_ posted is always set to the time
      // _you_ posted it.
      db!.raw(
        `COALESCE(
          (
            SELECT posts.created_at FROM posts WHERE user_id=? AND song_id=songs.id
          ),
          MIN(posts.created_at)
        ) as timestamp`,
        [opts.currentUserId]
      ),
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

  if (opts.beforeTimestamp) {
    query = query.where('timestamp', '<', opts.beforeTimestamp);
  }

  query = query.limit(ENTRY_PAGE_LIMIT);

  const rows = await query;

  return rows.map((row: any) => serializeFeedEntry(row));
}
