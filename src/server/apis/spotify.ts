import * as SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function getTrackById(id: string) {
  const res = await spotifyApi.getTrack(id);
  const track = res.body;
  return track;
}

export async function search(query: string) {
  const res = await spotifyApi.searchTracks(query);
  const tracks = res.body.tracks;
  return tracks;
}