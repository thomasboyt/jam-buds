import {db} from '../db';
import {decamelizeKeys} from 'humps';

interface PlaylistValues {
  userId: number;
  songId: number;
  youtubeUrl: string;
}

export async function addSongToPlaylist(values: PlaylistValues) {
  const query = db!.insert(decamelizeKeys(values)).into('playlist_entries');

  await (query as any);
}