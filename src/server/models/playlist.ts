import {db} from '../db';
import {decamelizeKeys} from 'humps';
import {PlaylistEntry, FeedEntry} from '../../universal/resources';
import {serializePublicUser} from './user';

interface PlaylistValues {
  userId: number;
  songId: number;
  youtubeUrl: string;
}

export async function addSongToPlaylist(values: PlaylistValues) {
  const query = db!.insert(decamelizeKeys(values)).into('playlist_entries');

  await (query as any);
}

function serializePlaylistEntry(row: any): PlaylistEntry {
  return {
    id: row.id,
    album: row.album,
    artists: row.artists,
    title: row.title,
    youtubeUrl: row.youtube_url,
    albumArt: row.album_art,
  };
}

function serializeFeedEntry(row: any): FeedEntry {
  const playlistEntry = serializePlaylistEntry(row);
  const user = serializePublicUser(row);

  return {
    song: playlistEntry,
    user,
  };
}

export async function getPlaylistByUserId(id: number): Promise<PlaylistEntry[]> {
  const query =
    db!('playlist_entries')
    .where({user_id: id})
    .join('songs', {'songs.id': 'playlist_entries.song_id'});

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}

export async function getFeedByUserId(id: number): Promise<FeedEntry[]> {
  const query =
    db!('playlist_entries')
    .join('following', {
      'following.following_id': 'playlist_entries.user_id',
      'following.user_id': db!.raw('?', [id]),
    })
    .join('users', {
      'users.id': 'following.following_id',
    });

  const rows = await (query as any);

  return rows.map((row: any) => serializeFeedEntry(row));
}