import apiRequest from '../util/apiRequest';
import {PublicUser} from '../../universal/resources';

export default async function followUser(userId: number): Promise<PublicUser> {
  const resp = await apiRequest({
    url: '/following',
    method: 'POST',
    data: {
      userId,
    },
  });

  return resp.data.user as PublicUser;
}