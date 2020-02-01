import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { MixtapePreview } from './models';

export async function getMixtapePreviewsByIds(
  handle: Handle,
  params: { mixtapeIds: number[] }
): Promise<MixtapePreview.Model[]> {
  if (params.mixtapeIds.length === 0) {
    return [];
  }

  const queryString = getQuery('getMixtapePreviewsByIds');

  return await handle
    .createQuery(queryString)
    .many(params, mapDecode(MixtapePreview.codec));
}
