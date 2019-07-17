import * as t from 'io-ts';
import * as Knex from 'knex';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { FeedSongItem, FeedItem, FeedMixtapeItem } from '../resources';
import { serializeSong, selectSongsQuery } from './song';
import validateOrThrow from '../util/validateOrThrow';
import traceQuery from '../util/traceQuery';

function serializeFeedSongItem(row: any): FeedSongItem {
  return {
    type: 'song',
    song: serializeSong(row),
    userNames: row.userNames,
    timestamp: row.timestamp.toISOString(),
  };
}

const MixtapePreviewModelV = t.type({
  id: t.number,
  title: t.string,
});

function serializeFeedMixtapeItem(row: any): FeedMixtapeItem {
  const preview = validateOrThrow(MixtapePreviewModelV, row.mixtape);

  return {
    type: 'mixtape',
    timestamp: row.timestamp.toISOString(),

    mixtape: {
      id: preview.id,
      // XXX: hack?
      authorName: row.userNames[0],
      title: preview.title,
      numTracks: row.mixtapeSongCount,
    },
  };
}

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<FeedItem[]> {
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

  const mixtapeCountQuery = `
    (SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id)
  `;

  let query = selectSongsQuery(db!('posts'), opts)
    .select([
      db!.raw('to_json(mixtapes.*) as mixtape'),
      db!.raw(`${timestampQuery} as timestamp`, [opts.currentUserId]),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
      db!.raw(`${mixtapeCountQuery} as mixtape_song_count`),
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

  query = query.limit(ENTRY_PAGE_LIMIT);

  const rows = await traceQuery(query);

  return rows.map(
    (row: any): FeedItem => {
      if (row.song) {
        return serializeFeedSongItem(row);
      } else {
        return serializeFeedMixtapeItem(row);
      }
    }
  );
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
