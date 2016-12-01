import apiRequest from '../util/apiRequest';

interface Params {
  spotifyId: string;
  url: string;
  tweet: string | null;
}

export default async function addSong({spotifyId, url, tweet}: Params): Promise<any> {
  await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: {
      spotifyId,
      youtubeUrl: url,
      tweet,
    },
  });
}