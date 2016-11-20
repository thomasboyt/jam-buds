import apiRequest from '../util/apiRequest';

export default async function addSong(spotifyId: string): Promise<any> {
  await apiRequest({
    url: '/playlist',
    method: 'POST',
    data: {
      spotifyId,
    },
  });
}