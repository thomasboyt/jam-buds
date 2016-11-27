import apiRequest from '../util/apiRequest';
import {Feed} from '../../universal/resources';

export default async function getFeed(): Promise<Feed> {
  const resp = await apiRequest({
    url: '/feed',
    method: 'GET',
  });

  return resp.data;
}