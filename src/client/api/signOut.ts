import apiRequest from '../util/apiRequest';

export default async function signOut(): Promise<void> {
  await apiRequest({
    url: `/session`,
    method: 'DELETE',
  });
}