import { db } from '../db';
import Knex from 'knex';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { User, serializePublicUser } from './user';
import { PlaylistEntry, Song } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { joinSongsQuery, serializeSong } from './song';
import { paginate } from './utils';

export interface CreateEntryParams {
  userId: number;
  songId: number;
  note: string;
}

export async function addSongToPlaylist(
  values: CreateEntryParams
): Promise<PlaylistEntry> {
  const query = db!
    .insert(decamelizeKeys(values))
    .into('playlist_entries')
    .returning('id');

  const [id] = await query;
  const entry = await getPlaylistEntryById(id);

  return entry!;
}

function serializePlaylistEntry(row: any): PlaylistEntry {
  const { song, isLiked, entry } = camelizeKeys(row) as any;
  const user = serializePublicUser(camelizeKeys(row.user) as User);

  return {
    id: entry.id,

    note: entry.note,
    added: entry.createdAt,

    song: serializeSong(song, isLiked),
    user,
  };
}

interface QueryOptions {
  currentUserId?: number;
  previousId?: number;
}

function getBasePlaylistQuery(opts: QueryOptions) {
  /*
   * Note: the db!.raw('to_json') calls are used to "namespace" the results here
   * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
   * This may not be a great idea performance-wise.
   */

  let query = db!('playlist_entries')
    .select(db!.raw('to_json(playlist_entries.*) as entry'))
    .join('users', {
      'users.id': 'playlist_entries.user_id',
    });

  return paginate(joinSongsQuery(query, opts), {
    limit: ENTRY_PAGE_LIMIT,
    previousId: opts.previousId,
    idColumn: 'playlist_entries.id',
  }).join('songs', {
    'songs.id': 'playlist_entries.song_id',
  });
}

export async function getPlaylistByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(opts)
    .where({ user_id: id })
    .orderBy('playlist_entries.id', 'desc');

  const rows = await query;

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry[]> {
  opts.currentUserId = id;

  const query = getBasePlaylistQuery(opts)
    .where(function() {
      this.whereIn('user_id', function() {
        this.select('following_id')
          .from('following')
          .where({ user_id: id });
      }).orWhere({ user_id: id });
    })
    .orderBy('playlist_entries.id', 'desc');

  const rows = await query;

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getPlaylistEntryById(
  id: number,
  opts: QueryOptions = {}
): Promise<PlaylistEntry | null> {
  const query = getBasePlaylistQuery(opts).where({ 'playlist_entries.id': id });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return serializePlaylistEntry(rows[0]);
}

export async function deletePlaylistEntryById(id: number): Promise<void> {
  const query = db!('playlist_entries')
    .where({ id })
    .delete();

  await query;
}
