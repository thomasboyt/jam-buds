import * as Knex from 'knex';
import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import {
  serializeSong,
  selectSongs,
  SongWithMetaModelV,
  SongWithMetaModel,
} from './song';
import {
  MixtapePreviewModelV,
  selectMixtapePreviews,
  MixtapePreviewModel,
} from './mixtapes';
import {
  PlaylistSongItem,
  PlaylistItem,
  PlaylistMixtapeItem,
} from '../resources';
import { findMany } from './utils';

const PlaylistItemModelV = t.type({
  timestamp: dateType,
  userNames: t.union([t.array(t.string), t.null, t.undefined]),
  songId: t.union([t.number, t.null, t.undefined]),
  mixtapeId: t.union([t.number, t.null, t.undefined]),
});

type PlaylistItemModel = t.TypeOf<typeof PlaylistItemModelV>;

interface PlaylistItemModelWithRelationships extends PlaylistItemModel {
  song?: SongWithMetaModel;
  mixtape?: MixtapePreviewModel;
}

function serializePlaylistSongItem(
  item: PlaylistItemModelWithRelationships
): PlaylistSongItem {
  const song = item.song!;
  return {
    type: 'song',
    song: serializeSong(song),
    userNames: item.userNames || undefined,
    timestamp: item.timestamp.toISOString(),
  };
}

function serializePlaylistMixtapeItem(
  item: PlaylistItemModelWithRelationships
): PlaylistMixtapeItem {
  const mixtape = item.mixtape!;

  return {
    type: 'mixtape',
    timestamp: item.timestamp.toISOString(),

    mixtape: {
      id: mixtape.id,
      slug: mixtape.slug,
      authorName: mixtape.authorName,
      title: mixtape.title,
      numTracks: parseInt(mixtape.songCount),
    },
  };
}

export function serializePlaylistItem(
  item: PlaylistItemModelWithRelationships
): PlaylistItem {
  if (item.song && item.song.id !== null) {
    return serializePlaylistSongItem(item);
  } else if (item.mixtape) {
    return serializePlaylistMixtapeItem(item);
  } else {
    throw new Error('cannot serialize post item');
  }
}

async function hydratePlaylistItems(
  playlistItems: PlaylistItemModel[],
  opts: QueryOptions
): Promise<PlaylistItemModelWithRelationships[]> {
  const songIds = playlistItems
    .map((item) => item.songId)
    .filter((songId) => !!songId);
  const mixtapeIds = playlistItems
    .map((item) => item.mixtapeId)
    .filter((mixtapeId) => !!mixtapeId);

  const songsQuery = db!('songs')
    .select(selectSongs(opts))
    .whereIn('songs.id', songIds);
  const songs = await findMany(songsQuery, SongWithMetaModelV);

  const mixtapesQuery = db!('mixtapes')
    .select(selectMixtapePreviews())
    .join('users', { 'users.id': 'mixtapes.user_id' })
    .whereIn('mixtapes.id', mixtapeIds);
  const mixtapes = await findMany(mixtapesQuery, MixtapePreviewModelV);

  return playlistItems.map((item) => {
    return {
      ...item,
      song: songs.find((song) => song.id === item.songId),
      mixtape: mixtapes.find((mixtape) => mixtape.id === item.mixtapeId),
    };
  });
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
    .select({
      songId: 'posts.song_id',
      mixtapeId: 'posts.mixtape_id',
      timestamp: 'posts.created_at',
    })
    .where({ 'posts.user_id': userId })
    .orderBy('posts.created_at', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'posts.created_at',
  });

  const playlistItems = await hydratePlaylistItems(
    await findMany(query, PlaylistItemModelV),
    opts
  );
  return playlistItems.map(serializePlaylistItem);
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
        SELECT
          user_posts.created_at
        FROM
          posts
        AS
          user_posts
        WHERE user_id=?
        AND user_posts.song_id=posts.song_id
      ),
      MIN(posts.created_at)
    )
  `;

  let postsQuery = db!('posts')
    .select([
      {
        songId: 'posts.song_id',
        mixtapeId: 'posts.mixtape_id',
      },
      db!.raw(`${timestampQuery} as timestamp`, [opts.currentUserId]),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('users', { 'users.id': 'posts.user_id' })
    .where(function(this: Knex.QueryBuilder) {
      this.whereIn('posts.user_id', function() {
        this.select('following_id')
          .from('following')
          .where({ 'following.user_id': id });
      }).orWhere({ 'posts.user_id': id });
    })
    .groupBy('posts.song_id', 'posts.mixtape_id')
    .orderBy('timestamp', 'desc');

  if (opts.beforeTimestamp !== undefined) {
    postsQuery = postsQuery.havingRaw(`${timestampQuery} < ?`, [
      opts.currentUserId,
      opts.beforeTimestamp,
    ]);
  }
  if (opts.afterTimestamp !== undefined) {
    postsQuery = postsQuery.havingRaw(`${timestampQuery} > ?`, [
      opts.currentUserId,
      opts.afterTimestamp,
    ]);
  }

  // after queries are unlimited since there's no UI for "head" pagination
  if (opts.afterTimestamp === undefined) {
    postsQuery = postsQuery.limit(ENTRY_PAGE_LIMIT);
  }

  const playlistItems = await hydratePlaylistItems(
    await findMany(postsQuery, PlaylistItemModelV),
    opts
  );
  return playlistItems.map(serializePlaylistItem);
}

// XXX: A whole bunch of this is duplicated with getFeedByUserId, should
// probably dedupe some day
export async function getPublicFeed(
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
  let query = db!('posts')
    .select([
      {
        songId: 'posts.song_id',
        mixtapeId: 'posts.mixtape_id',
      },
      db!.raw(`MIN(posts.created_at) as timestamp`),
      db!.raw('ARRAY_AGG(users.name) as user_names'),
    ])
    .join('users', { 'users.id': 'posts.user_id' })
    .where({ show_in_public_feed: true })
    .groupBy('posts.song_id', 'posts.mixtape_id')
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

  const playlistItems = await hydratePlaylistItems(
    await findMany(query, PlaylistItemModelV),
    opts
  );
  return playlistItems.map(serializePlaylistItem);
}

export async function getLikesByUserId(
  userId: number,
  opts: QueryOptions
): Promise<PlaylistItem[]> {
  let query = db!('likes')
    .select({
      songId: 'likes.song_id',
      // mixtapeId: 'likes.mixtape_id',
      timestamp: 'likes.created_at',
    })
    .where({
      user_id: userId,
    })
    .orderBy('likes.id', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'likes.created_at',
  });

  const playlistItems = await hydratePlaylistItems(
    await findMany(query, PlaylistItemModelV),
    opts
  );
  return playlistItems.map(serializePlaylistItem);
}

export async function getPublishedMixtapesByUserId(
  userId: number,
  opts: QueryOptions = {}
): Promise<PlaylistItem[]> {
  let query = db!('mixtapes')
    .select({
      mixtapeId: 'mixtapes.id',
      timestamp: 'mixtapes.published_at',
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

  const playlistItems = await hydratePlaylistItems(
    await findMany(query, PlaylistItemModelV),
    opts
  );
  return playlistItems.map(serializePlaylistItem);
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
