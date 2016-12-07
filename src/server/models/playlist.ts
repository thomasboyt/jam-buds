import {db} from '../db';
import {camelizeKeys, decamelizeKeys} from 'humps';
import {PlaylistEntry, FeedEntry} from '../../universal/resources';
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

function serializePlaylistEntry(row: any): PlaylistEntry {
  const entry = row.entry;
  const song = row.song;

  return {
    id: entry.id,
    youtubeUrl: entry.youtube_url,
    note: entry.note,
    album: song.album,
    artists: song.artists,
    title: song.title,
    albumArt: song.album_art,
    added: entry.created_at,
    spotifyId: song.spotify_id,
  };
}

function serializeFeedEntry(row: any): FeedEntry {
  const playlistEntry = serializePlaylistEntry(row);
  const user = serializePublicUser(camelizeKeys(row.user) as User);

  return {
    song: playlistEntry,
    user,
  };
}

/*
 * Note: the db!.raw('to_json') calls are used to "namespace" the results here
 * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
 * This may not be a great idea performance-wise.
 */

export async function getPlaylistByUserId(id: number): Promise<PlaylistEntry[]> {
  const query =
    db!.select([
      db!.raw('to_json(playlist_entries.*) as entry'),
      db!.raw('to_json(songs.*) as song'),
    ])
    .from('playlist_entries')
    .where({user_id: id})
    .join('songs', {'songs.id': 'playlist_entries.song_id'})
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getFeedByUserId(id: number): Promise<FeedEntry[]> {
  const query =
    db!.select([
      db!.raw('to_json(playlist_entries.*) as entry'),
      db!.raw('to_json(following.*) as following'),
      db!.raw('to_json(users.*) as user'),
      db!.raw('to_json(songs.*) as song'),
    ])
    .from('playlist_entries')
    .join('following', {
      'following.following_id': 'playlist_entries.user_id',
      'following.user_id': db!.raw('?', [id]),
    })
    .join('users', {
      'users.id': 'following.following_id',
    })
    .join('songs', {
      'songs.id': 'playlist_entries.song_id',
    })
    .orderBy('playlist_entries.created_at', 'desc');

  const rows = await (query as any);

  return rows.map((row: any) => serializeFeedEntry(row));
}