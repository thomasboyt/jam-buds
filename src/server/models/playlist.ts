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
    albumArt: row.album_art,
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

export async function getFeedByUserId(id: number): Promise<PlaylistEntry[]> {
  // select * from playlist_entries where user_id in (select following_id from following where user_id=1);

  const query =
    db!('playlist_entries')
    .whereIn('user_id', function() {
      this.select('following_id').from('following').where({user_id: id});
    });

  const rows = await (query as any);

  return rows.map((row: any) => serializePlaylistEntry(row));
}