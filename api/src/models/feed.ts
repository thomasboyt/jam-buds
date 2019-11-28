import * as Knex from 'knex';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import {
  PostListSongItem,
  PostListItem,
  PostListMixtapeItem,
} from '../resources';
import { serializeSong, selectSongsQuery } from './song';
import { MixtapePreviewModelV, selectMixtapePreviews } from './mixtapes';
import validateOrThrow from '../util/validateOrThrow';

function serializePostListSongItem(row: any): PostListSongItem {
  return {
    type: 'song',
    song: serializeSong(row),
    userNames: row.userNames,
    timestamp: row.timestamp.toISOString(),
  };
}

function serializePostListMixtapeItem(row: any): PostListMixtapeItem {
  const preview = validateOrThrow(MixtapePreviewModelV, row.mixtape);

  return {
    type: 'mixtape',
    timestamp: row.timestamp.toISOString(),

    mixtape: {
      id: preview.id,
      authorName: preview.authorName,
      title: preview.title,
      numTracks: parseInt(preview.songCount),
    },
  };
}

export function serializePostListItem(row: any): PostListItem {
  if (row.song.id !== null) {
    return serializePostListSongItem(row);
  } else {
    return serializePostListMixtapeItem(row);
  }
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
  afterTimestamp?: string;
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<PostListItem[]> {
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

  let query = selectSongsQuery(db!('posts'), opts)
    .select([
      ...selectMixtapePreviews(),
      db!.raw(`${timestampQuery} as timestamp`, [opts.currentUserId]),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('users', { 'users.id': 'posts.user_id' })
    .leftOuterJoin('songs', { 'songs.id': 'posts.song_id' })
    .leftOuterJoin('mixtapes', { 'mixtapes.id': 'posts.mixtape_id' })
    .where(function(this: Knex.QueryBuilder) {
      this.whereIn('posts.user_id', function() {
        this.select('following_id')
          .from('following')
          .where({ 'following.user_id': id });
      }).orWhere({ 'posts.user_id': id });
    })
    // TODO: =\ not sure why all this is needed
    .groupBy('songs.*', 'songs.id', 'mixtapes.*', 'mixtapes.id')
    .orderBy('timestamp', 'desc');

  if (opts.beforeTimestamp !== undefined) {
    query = query.havingRaw(`${timestampQuery} < ?`, [
      opts.currentUserId,
      opts.beforeTimestamp,
    ]);
  }
  if (opts.afterTimestamp !== undefined) {
    query = query.havingRaw(`${timestampQuery} > ?`, [
      opts.currentUserId,
      opts.afterTimestamp,
    ]);
  }

  // after queries are unlimited since there's no UI for "head" pagination
  if (opts.afterTimestamp === undefined) {
    query = query.limit(ENTRY_PAGE_LIMIT);
  }

  const rows = await query;

  return rows.map(serializePostListItem);
}

// XXX: A whole bunch of this is duplicated with getFeedByUserId, should
// probably dedupe some day
export async function getPublicFeed(
  opts: QueryOptions = {}
): Promise<PostListItem[]> {
  let query = selectSongsQuery(db!('posts'), opts)
    .select([
      ...selectMixtapePreviews(),
      db!.raw(`MIN(posts.created_at) as timestamp`),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('users', { 'users.id': 'posts.user_id' })
    .leftOuterJoin('songs', { 'songs.id': 'posts.song_id' })
    .leftOuterJoin('mixtapes', { 'mixtapes.id': 'posts.mixtape_id' })
    .where({ show_in_public_feed: true })
    .groupBy('songs.*', 'songs.id', 'mixtapes.*', 'mixtapes.id')
    .orderBy('timestamp', 'desc');

  if (opts.beforeTimestamp !== undefined) {
    query = query.havingRaw(`MIN(posts.created_at) < ?`, [
      opts.beforeTimestamp,
    ]);
  }
  if (opts.afterTimestamp !== undefined) {
    query = query.havingRaw(`MIN(posts.created_at) > ?`, [opts.afterTimestamp]);
  }

  // after queries are unlimited since there's no UI for "head" pagination
  if (opts.afterTimestamp === undefined) {
    query = query.limit(ENTRY_PAGE_LIMIT);
  }

  const rows = await query;

  return rows.map(serializePostListItem);
}
