import apiRequest from '../util/apiRequest';
import {Playlist} from '../../universal/resources';

export default async function getLikedPlaylist(name: string, previousId: number | null): Promise<Playlist> {
  const resp = await apiRequest({
    url: `/playlists/${name}/liked`,
    method: 'GET',
    params: {previousId},
  });

  return resp.data;
}