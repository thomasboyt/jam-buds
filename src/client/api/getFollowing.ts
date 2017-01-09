import {Following} from '../../universal/resources';
import apiRequest from '../util/apiRequest';

export default async function getFollowing(userName: string): Promise<Following> {
  const resp = await apiRequest({
    url: `/users/${userName}/following`,
    method: 'GET',
  });

  return resp.data;
}