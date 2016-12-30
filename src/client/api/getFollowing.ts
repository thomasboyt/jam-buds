import {PublicUser} from '../../universal/resources';
import apiRequest from '../util/apiRequest';

export default async function getFollowing(userName: string): Promise<PublicUser[]> {
  const resp = await apiRequest({
    url: `/users/${userName}/following`,
    method: 'GET',
  });

  return resp.data.users;
}