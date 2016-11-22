import apiRequest from '../util/apiRequest';
import {Playlist} from '../../universal/resources';

export default async function getPlaylist(name: string): Promise<Playlist> {
  const resp = await apiRequest({
    url: `/playlists/${name}`,
    method: 'GET',
  });

  return resp.data;
}