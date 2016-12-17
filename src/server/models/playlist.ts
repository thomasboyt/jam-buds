import {db} from '../db';
import {camelizeKeys, decamelizeKeys} from 'humps';
import {PlaylistEntry, Song} from '../../universal/resources';
import {User, serializePublicUser} from './user';

interface PlaylistValues {
  userId: number;
  songId: number;
  youtubeUrl: string;
  note: string;
}

export async function addSongToPlaylist(values: PlaylistValues) {
  const query = db!.insert(decamelizeKeys(values)).into('playlist_entries');

  await (query as any);
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
    youtubeUrl: entry.youtube_url,
    note: entry.note,
    added: entry.created_at,
    isLiked: row.is_liked,

    song: serializeSong(song) as Song,
    user,
  };
}

function getBasePlaylistQuery(currentUserId?: number) {
  const select = [
    db!.raw('to_json(playlist_entries.*) as entry'),
    db!.raw('to_json(songs.*) as song'),
    db!.raw('to_json(users.*) as user'),
  ];

  if (currentUserId !== undefined) {
    select.push(db!.raw(
      'EXISTS(SELECT 1 FROM likes WHERE user_id=? AND entry_id=playlist_entries.id) AS is_liked',
      [currentUserId]
    ));
  }

  return db!.select(select)
    .from('playlist_entries')
    .join('songs', {
      'songs.id': 'playlist_entries.song_id',
    })
    .join('users', {
      'users.id': 'playlist_entries.user_id',
    });
}

/*
 * Note: the db!.raw('to_json') calls are used to "namespace" the results here
 * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
 * This may not be a great idea performance-wise.
 */

export async function getPlaylistByUserId(id: number, currentUserId?: number): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(currentUserId)
    .where({user_id: id})
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getFeedByUserId(id: number): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(id)
    .select([
      db!.raw('to_json(following.*) as following'),
    ])
    .join('following', {
      'following.following_id': 'playlist_entries.user_id',
      'following.user_id': db!.raw('?', [id]),
    })
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getLikedEntriesByUserId(id: number, currentUserId?: number): Promise<PlaylistEntry[]> {
  const query = getBasePlaylistQuery(currentUserId)
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

export async function getPlaylistEntryById(id: number, currentUserId?: number): Promise<PlaylistEntry | null> {
  const query = getBasePlaylistQuery(currentUserId)
    .where({'playlist_entries.id': id});

  const rows = await (query as any);

  if (!rows[0]) {
    return null;
  }

  return serializePlaylistEntry(rows[0]);
}