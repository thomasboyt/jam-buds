import apiRequest from '../util/apiRequest';

export default async function getPlaylist(name: string): Promise<any> {
  const resp = await apiRequest({
    url: `/playlists/${name}`,
    method: 'GET',
  });

  return resp.data.playlist;
}