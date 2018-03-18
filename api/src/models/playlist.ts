import {db} from '../db';
import {camelizeKeys, decamelizeKeys} from 'humps';
import {User, serializePublicUser} from './user';
import {PlaylistEntry, Song, PlaybackSource} from '../resources';
import {ENTRY_PAGE_LIMIT} from '../constants';

export interface CreateEntryParams {
  userId: number;
  songId: number;
  note: string;

  source: PlaybackSource;

  youtubeUrl?: string;

  bandcampTrackId?: string;
  bandcampStreamingUrl?: string;
  bandcampUrl?: string;

  soundcloudTrackId?: string;
  soundcloudStreamingUrl?: string;
  soundcloudUrl?: string;
}

export async function addSongToPlaylist(values: CreateEntryParams): Promise<PlaylistEntry> {
  const query = db!.insert(decamelizeKeys(values)).into('playlist_entries').returning('id');

  const [id] = await (query as any);
  const entry = await getPlaylistEntryById(id);

  return entry!;
}

function serializeSong(song: any): Song {
  return {
    album: song.album,
    artists: song.artists,
    title: song.title,
    albumArt: song.album_art,
    spotifyId: song.spotify_id,
  };
}

function serializePlaylistEntry(row: any): PlaylistEntry {
  const {song, entry} = row;
  const user = serializePublicUser(camelizeKeys(row.user) as User);

  return {
    id: entry.id,

    source: entry.source,

    youtubeUrl: entry.youtube_url,
    bandcampStreamingUrl: entry.bandcamp_streaming_url,
    bandcampUrl: entry.bandcamp_url,

    soundcloudStreamingUrl: entry.soundcloud_streaming_url,
    soundcloudUrl: entry.soundcloud_url,

    note: entry.note,
    added: entry.created_at,
    isLiked: row.is_liked,

    song: serializeSong(song) as Song,
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
  const select = [
    db!.raw('to_json(playlist_entries.*) as entry'),
    db!.raw('to_json(songs.*) as song'),
    db!.raw('to_json(users.*) as user'),
  ];

  if (opts.currentUserId !== undefined) {
    select.push(db!.raw(
      'EXISTS(SELECT 1 FROM likes WHERE user_id=? AND entry_id=playlist_entries.id) AS is_liked',
      [opts.currentUserId]
    ));
  }

  let query = db!.select(select)
    .from('playlist_entries')
    .join('songs', {
      'songs.id': 'playlist_entries.song_id',
    })
    .join('users', {
      'users.id': 'playlist_entries.user_id',
    })
    .limit(ENTRY_PAGE_LIMIT);

  if (opts.previousId !== undefined) {
    query = query.where('playlist_entries.id', '<', opts.previousId);
  }

  return query;
}

export async function getPlaylistByUserId(id: number, opts: QueryOptions = {}): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(opts)
    .where({user_id: id})
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getFeedByUserId(id: number, opts: QueryOptions = {}): Promise<PlaylistEntry[]> {
  opts.currentUserId = id;

  const query = getBasePlaylistQuery(opts)
    .where(function() {
      this.whereIn('user_id', function() {
        this.select('following_id')
          .from('following')
          .where({user_id: id});
      }).orWhere({user_id: id})
    })
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getLikedEntriesByUserId(id: number, opts: QueryOptions = {}): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(opts)
    .select([
      db!.raw('to_json(likes.*) as like'),
    ])
    .join('likes', {
      'likes.entry_id': 'playlist_entries.id'
    })
    .orderBy('likes.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getPlaylistEntryById(id: number, opts: QueryOptions = {}): Promise<PlaylistEntry | null> {
  const query = getBasePlaylistQuery(opts)
    .where({'playlist_entries.id': id});

  const rows = await (query as any);

  if (!rows[0]) {
    return null;
  }

  return serializePlaylistEntry(rows[0]);
}

export async function likePlaylistEntry(userId: number, entryId: number): Promise<void> {
  const query = db!('likes').insert({
    entry_id: entryId,
    user_id: userId,
  });

  await (query as any);
}

export async function unlikePlaylistEntry(userId: number, entryId: number): Promise<void> {
  const query = db!('likes').where({
    entry_id: entryId,
    user_id: userId,
  }).delete();

  await (query as any);
}

export async function deletePlaylistEntryById(id: number): Promise<void> {
  const query = db!('playlist_entries').where({id}).delete();

  await (query as any);
}