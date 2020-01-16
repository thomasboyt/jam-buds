import SpotifyWebApi from 'spotify-web-api-node';
import config from '../config';

let spotifyApi: unknown;

function getSpotifyApi() {
  if (spotifyApi) {
    return spotifyApi;
  }

  spotifyApi = new SpotifyWebApi({
    clientId: config.require('SPOTIFY_CLIENT_ID'),
    clientSecret: config.require('SPOTIFY_CLIENT_SECRET'),
  });

  return spotifyApi as any;
}

async function getToken() {
  console.log('*** Refreshing Spotify token');

  try {
    const data = await getSpotifyApi().clientCredentialsGrant();
    getSpotifyApi().setAccessToken(data.body['access_token']);
  } catch (err) {
    console.error(`*** Failed to acquire Spotify token:`);
    throw err;
    /// TODO: RETRY WITH BACKOFF!!
  }
}

export function startSpotifyTokenUpdates() {
  if (
    config.get('NODE_ENV') !== 'test' ||
    config.get('TEST_ENV') === 'feature'
  ) {
    getToken();
    // new token very five minutes
    setInterval(getToken, 60 * 5 * 1000);
  }
}

// https://developer.spotify.com/documentation/web-api/reference/tracks/get-track/
export interface SpotifySongResource {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_ids: {
    isrc: string | undefined;
  };
}

/**
 * Look up a Spotify track by a given Spotify track ID.
 */
export async function getTrackById(
  id: string
): Promise<SpotifySongResource | null> {
  let res;
  try {
    res = await getSpotifyApi().getTrack(id);
  } catch (err) {
    if (err.status === 400) {
      return null;
    }
    throw err;
  }
  const track = res.body;
  return track;
}

/**
 * Get a list of Spotify search results for a specific query.
 */
export async function search(query: string): Promise<SpotifySongResource[]> {
  const res = await getSpotifyApi().searchTracks(query);
  const tracks = res.body.tracks.items;
  return tracks;
}
