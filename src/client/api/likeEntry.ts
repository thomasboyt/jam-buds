import apiRequest from '../util/apiRequest';

export default async function likeEntry(entryId: number): Promise<void> {
   await apiRequest({
    url: `/likes/${entryId}`,
    method: 'PUT',
  });
}