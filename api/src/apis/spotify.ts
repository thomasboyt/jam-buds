import * as SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

function getToken() {
  console.log('*** Refreshing Spotify token');

  spotifyApi.clientCredentialsGrant()
    .then((data: any) => {
      spotifyApi.setAccessToken(data.body['access_token']);
    });
}

getToken();

setInterval(getToken, 60 * 30 * 1000);

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