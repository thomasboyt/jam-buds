import apiRequest from '../util/apiRequest';

export default async function getShareLinkDetails(url: string): Promise<any> {
  const resp = await apiRequest({
    url: '/share-details',
    method: 'GET',
    params: { url },
  });

  return resp.data;
}