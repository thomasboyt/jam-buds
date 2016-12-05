import apiRequest from '../util/apiRequest';

interface Params {
  spotifyId: string;
  youtubeUrl: string;
  tweet: string | null;
  note?: string,

  manualEntry: boolean;
  artist?: string;
  title?: string;
}

export default async function addSong(params: Params): Promise<any> {
  await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: params,
  });
}