import apiRequest from '../util/apiRequest';
import {PlaylistEntry} from '../../universal/resources';

interface Params {
  youtubeUrl: string;
  tweet: string | null;
  spotifyId: string | null;
  note?: string,

  manualEntry: boolean;
  artist?: string;
  title?: string;
}

export default async function addSong(params: Params): Promise<PlaylistEntry> {
  const resp = await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: params,
  });

  return resp.data;
}