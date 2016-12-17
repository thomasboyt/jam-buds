import apiRequest from '../util/apiRequest';

export default async function unlikeEntry(entryId: number): Promise<void> {
   await apiRequest({
    url: `/likes/${entryId}`,
    method: 'DELETE',
  });
}