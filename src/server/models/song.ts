import {db} from '../db';
import {camelizeKeys} from 'humps';

export interface Song {
  id: number;
  spotifyId: string;
  artists: string[];
  album: string;
  name: string;
}

export async function getSongBySpotifyId(spotifyId: number): Promise<Song | null> {
  const query = db!('songs').where({spotify_id: spotifyId});

  let [row] = await (query as any);

  if (!row) {
    return null;
  }

  const song = camelizeKeys(row) as Song;

  return song;
}

interface SpotifyResource {
  name: string;
  album: {
    name: string;
    images: {url: string}[];
  };
  artists: {
    name: string;
  }[];
  id: string;
}

export async function createSongFromSpotifyResource(res: SpotifyResource): Promise<Song> {
  const values = {
    spotify_id: res.id,
    artists: res.artists.map((artist) => artist.name),
    album: res.album.name,
    title: res.name,
    album_art: res.album.images[0].url,
  };

  const query = db!.insert(values).returning('*').into('songs');

  const [row] = await (query as any);
  const song = camelizeKeys(row) as Song;

  return song;
}

export async function createSongFromManualEntry(artist: string, title: string): Promise<Song> {
  const values = {
    artists: [artist],
    title: title,
  };

  const query = db!.insert(values).returning('*').into('songs');

  const [row] = await (query as any);
  const song = camelizeKeys(row) as Song;

  return song;
}
