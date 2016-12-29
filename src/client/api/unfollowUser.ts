import apiRequest from '../util/apiRequest';

export default async function unfollowUser(userId: number): Promise<void> {
  await apiRequest({
    url: `/following/${userId}`,
    method: 'DELETE',
  });
}