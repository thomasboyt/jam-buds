import * as SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getToken() {
  console.log('*** Refreshing Spotify token');

  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch(err) {
    console.error(`*** Failed to acquire Spotify token:`)
    throw err;
    /// TODO: RETRY WITH BACKOFF!!
  }
}

if (process.env.NODE_ENV !== 'test') {
  getToken();
  // new token very five minutes
  setInterval(getToken, 60 * 5 * 1000);
}

/**
 * Look up a Spotify track by a given Spotify track ID.
 */
export async function getTrackById(id: string): Promise<any> {
  const res = await spotifyApi.getTrack(id);
  const track = res.body;
  return track;
}

/**
 * Get a list of Spotify search results for a specific query.
 */
export async function search(query: string): Promise<any[]> {
  const res = await spotifyApi.searchTracks(query);
  const tracks = res.body.tracks.items;
  return tracks;
}