import apiRequest from '../util/apiRequest';

export default async function getSongsSearch(query: string): Promise<any> {
  const resp = await apiRequest({
    url: '/spotify-search',
    method: 'GET',
    params: { query },
  });

  return resp.data.songs;
}