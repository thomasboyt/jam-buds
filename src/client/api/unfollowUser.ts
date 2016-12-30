import apiRequest from '../util/apiRequest';

export default async function unfollowUser(userName: string): Promise<void> {
  await apiRequest({
    url: `/following/${userName}`,
    method: 'DELETE',
  });
}