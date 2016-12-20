import apiRequest from '../util/apiRequest';

export default async function deleteEntry(entryId: number): Promise<void> {
   await apiRequest({
    url: `/playlist/${entryId}`,
    method: 'DELETE',
  });
}