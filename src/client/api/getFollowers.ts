import {PublicUser} from '../../universal/resources';
import apiRequest from '../util/apiRequest';

export default async function getFollowers(userName: string): Promise<PublicUser[]> {
  const resp = await apiRequest({
    url: `/users/${userName}/followers`,
    method: 'GET',
  });

  return resp.data.users;
}