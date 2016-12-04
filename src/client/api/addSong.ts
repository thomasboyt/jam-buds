import apiRequest from '../util/apiRequest';

interface Params {
  spotifyId: string;
  url: string;
  tweet: string | null;
  note?: string,
}

export default async function addSong({spotifyId, url, tweet, note}: Params): Promise<any> {
  await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: {
      spotifyId,
      youtubeUrl: url,
      tweet,
      note,
    },
  });
}