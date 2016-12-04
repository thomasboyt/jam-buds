import apiRequest from '../util/apiRequest';
import {PublicUser} from '../../universal/resources';

export default async function getFriendSuggestions(): Promise<PublicUser[]> {
  const resp = await apiRequest({
    url: '/friend-suggestions',
    method: 'GET',
  });

  return resp.data.users;
}