import * as Knex from 'knex';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { selectSongs, serializeSong } from './song';
import { MixtapePreviewModelV, selectMixtapePreviews } from './mixtapes';
import {
  PlaylistSongItem,
  PlaylistItem,
  PlaylistMixtapeItem,
} from '../resources';
import validateOrThrow from '../util/validateOrThrow';

function serializePlaylistSongItem(row: any): PlaylistSongItem {
  return {
    type: 'song',
    song: serializeSong(row),
    userNames: row.userNames,
    timestamp: row.timestamp.toISOString(),
  };
}

function serializePlaylistMixtapeItem(row: any): PlaylistMixtapeItem {
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

export function serializePlaylistItem(row: any): PlaylistItem {
  if (row.song && row.song.id !== null) {
    return serializePlaylistSongItem(row);
  } else if (row.mixtape) {
    return serializePlaylistMixtapeItem(row);
  } else {
    throw new Error('cannot serialize post item');
  }
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
  afterTimestamp?: string;
}

export async function getPostsByUserId(
  userId: number,
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
  let query = db!('posts')
    .select(selectSongs(opts))
    .select(selectMixtapePreviews())
    .select({
      timestamp: 'posts.created_at',
      userName: 'users.name',
    })
    .join('users', { 'users.id': 'posts.user_id' })
    .leftOuterJoin('songs', { 'songs.id': 'posts.song_id' })
    .leftOuterJoin('mixtapes', { 'mixtapes.id': 'posts.mixtape_id' })
    .where({ 'posts.user_id': userId })
    .orderBy('posts.created_at', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'posts.created_at',
  });

  const rows = await query;

  return rows.map(serializePlaylistItem);
}

export async function getPublishedMixtapesByUserId(
  userId: number,
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
  let query = db!('mixtapes')
    .select(selectMixtapePreviews())
    .select({
      timestamp: 'mixtapes.published_at',
      userName: 'users.name',
    })
    .join('users', { 'users.id': 'mixtapes.user_id' })
    .where({ 'mixtapes.user_id': userId })
    .whereNot({ 'mixtapes.published_at': null })
    .orderBy('mixtapes.published_at', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'mixtapes.published_at',
  });

  const rows = await query;

  return rows.map(serializePlaylistItem);
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
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

  let query = db!('posts')
    .select([
      ...selectSongs(opts),
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

  return rows.map(serializePlaylistItem);
}

// XXX: A whole bunch of this is duplicated with getFeedByUserId, should
// probably dedupe some day
export async function getPublicFeed(
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
  let query = db!('posts')
    .select([
      ...selectSongs(opts),
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

  return rows.map(serializePlaylistItem);
}

export async function getLikesByUserId(
  userId: number,
  opts: QueryOptions
): Promise<PlaylistSongItem[]> {
  const query = db!('likes')
    .select([...selectSongs(opts), db!.raw('likes.created_at as timestamp')])
    .join('songs', {
      'songs.id': 'likes.song_id',
    })
    .join('users', {
      'users.id': 'likes.user_id',
    })
    .where({
      user_id: userId,
    })
    .orderBy('likes.id', 'desc');

  const rows = await paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'likes.created_at',
  });

  return rows.map(serializePlaylistSongItem);
}

interface PaginationOptions {
  limit: number;
  columnName: string;
  before?: string;
  after?: string;
}

/**
 * Only use this for playlist pagination, due to the weird limiting rules
 */
export function paginate(query: Knex.QueryBuilder, opts: PaginationOptions) {
  if (opts.before !== undefined) {
    query = query.where(opts.columnName, '<', opts.before);
  }
  if (opts.after !== undefined) {
    query = query.where(opts.columnName, '>', opts.after);
  }

  // after queries are unlimited since there's no UI for "head" pagination
  if (opts.after === undefined) {
    query = query.limit(opts.limit);
  }

  return query;
}
