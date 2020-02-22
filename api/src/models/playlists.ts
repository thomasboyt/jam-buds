import * as Knex from 'knex';

import { db } from '../db';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { selectSongs, serializeSong } from './song';
import { MixtapePreviewModelV } from './mixtapes';
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
      slug: preview.slug,
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
