import axios from 'axios';
import * as microdata from 'microdata-node';

/**
 * Given a bandcamp track URL, return a Spotify search query that will return the same song.
 */
export async function getSpotifyQuery(url: string): Promise<string> {
  const resp = await axios.get(url);
  const data = microdata.toJson(resp.data);
  const recording = data.items.find((item: any) => item.type[0] === 'http://schema.org/MusicRecording').properties;

  const name = recording.name[0].trim();
  const artist = recording.byArtist[0].trim();
  const album = recording.inAlbum[0].properties.name[0].trim();

  return `artist:${artist} track:${name} album:${album}`;
}