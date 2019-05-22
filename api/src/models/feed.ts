import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { FeedEntry } from '../resources';
import { serializeSong, SongModelV } from './song';
import validateOrThrow from '../util/validateOrThrow';

function serializeFeedEntry(row: any): FeedEntry {
  const { isLiked } = row;

  return {
    song: serializeSong(
      validateOrThrow(SongModelV, camelcaseKeys(row.song)),
      isLiked
    ),
    postedBy: row.userNames,
    firstPostedAt: row.earliestPosted,
  };
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<FeedEntry[]> {
  opts.currentUserId = id;

  let query = db!('songs')
    .select([
      db!.raw('to_json(songs.*) as song'),
      db!.raw('MIN(posts.created_at) as earliest_posted'),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
      db!.raw(
        'EXISTS(SELECT 1 FROM likes WHERE user_id=? AND song_id=songs.id) AS is_liked',
        [opts.currentUserId]
      ),
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
    .orderBy('earliest_posted', 'desc');

  if (opts.beforeTimestamp) {
    query = query.where('earliest_posted', '<', opts.beforeTimestamp);
  }

  query = query.limit(ENTRY_PAGE_LIMIT);

  const rows = await query;

  return rows.map((row: any) => serializeFeedEntry(row));
}
