import apiRequest from '../util/apiRequest';
import {Playlist} from '../../universal/resources';

export default async function getPlaylist(name: string, previousId: number | null): Promise<Playlist> {
  const resp = await apiRequest({
    url: `/playlists/${name}`,
    method: 'GET',
    params: {previousId},
  });

  return resp.data;
}