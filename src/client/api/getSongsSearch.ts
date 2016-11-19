import apiRequest from '../util/apiRequest';

export default async function getCurrentUser(query: string): Promise<any> {
  const resp = await apiRequest({
    url: '/songs',
    method: 'GET',
    params: {
      query: query
    },
  });
}