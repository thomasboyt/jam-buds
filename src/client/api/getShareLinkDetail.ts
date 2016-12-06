import apiRequest from '../util/apiRequest';

import {ShareLinkDetails} from '../../universal/resources';

export default async function getShareLinkDetails(url: string): Promise<ShareLinkDetails> {
  const resp = await apiRequest({
    url: '/share-details',
    method: 'GET',
    params: { url },
  });

  return resp.data;
}