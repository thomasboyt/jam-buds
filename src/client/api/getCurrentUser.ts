import apiRequest from '../util/apiRequest';
import {CurrentUser} from '../../universal/resources';

export default async function getCurrentUser(): Promise<CurrentUser | null> {
  const resp = await apiRequest({
    url: '/me',
    method: 'GET',
  });

  if (resp.data.user) {
    return resp.data.user as CurrentUser;
  } else {
    return null;
  }
}