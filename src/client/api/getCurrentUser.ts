import apiRequest from '../util/apiRequest';

interface User {
  name: string;
}

export default async function getCurrentUser(): Promise<User | null> {
  const resp = await apiRequest({
    url: '/users/me',
    method: 'GET',
  });

  if (resp.data.user) {
    return resp.data.user as User;
  } else {
    return null;
  }
}