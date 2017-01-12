import apiRequest from '../util/apiRequest';
import {PlaylistEntry, PlaybackSource} from '../../universal/resources';

interface Params {
  tweet: string | null;
  spotifyId: string | null;
  note?: string,

  manualEntry: boolean;
  artist?: string;
  title?: string;

  source: PlaybackSource,
  youtubeUrl?: string;
  bandcampTrackId?: string;
  bandcampUrl?: string;
}

export default async function addSong(params: Params): Promise<PlaylistEntry> {
  const resp = await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: params,
  });

  return resp.data;
}