import apiRequest from '../util/apiRequest';
import {Feed} from '../../universal/resources';

export default async function getFeed(previousId: number | null): Promise<Feed> {
  const resp = await apiRequest({
    url: '/feed',
    method: 'GET',
    params: {previousId},
  });

  return resp.data;
}