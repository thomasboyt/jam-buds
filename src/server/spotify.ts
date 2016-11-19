import * as SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function search(query: string) {
  const res = await spotifyApi.searchTracks(query);

  console.log(res);

  const tracks = res.body.tracks;

  console.log(tracks);

  return tracks;
}