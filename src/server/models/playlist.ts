import {db} from '../db';
import {decamelizeKeys} from 'humps';
import {PlaylistEntry} from '../../universal/resources';

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
  };
}

export async function getPlaylistByUserId(id: number) {
  const query =
    db!('playlist_entries')
    .where({user_id: id})
    .join('songs', {'songs.id': 'playlist_entries.song_id'});

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}