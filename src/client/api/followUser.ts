import apiRequest from '../util/apiRequest';
import {PublicUser} from '../../universal/resources';

export default async function followUser(userName: string): Promise<PublicUser> {
  const resp = await apiRequest({
    url: '/following',
    method: 'POST',
    data: {
      userName,
    },
  });

  return resp.data.user as PublicUser;
}