import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getToken() {
  console.log('*** Refreshing Spotify token');

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (err) {
    console.error(`*** Failed to acquire Spotify token:`);
    throw err;
    /// TODO: RETRY WITH BACKOFF!!
  }
}

export function startSpotifyTokenUpdates() {
  if (process.env.NODE_ENV !== 'test' || process.env.TEST_ENV === 'feature') {
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
    res = await spotifyApi.getTrack(id);
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
  const res = await spotifyApi.searchTracks(query);
  const tracks = res.body.tracks.items;
  return tracks;
}
