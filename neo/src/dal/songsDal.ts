import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { SongWithMeta } from './models';

interface GetSongsByIdsParams {
  currentUserId: number;
  songIds: number[];
}

export async function getSongsByIds(
  handle: Handle,
  params: GetSongsByIdsParams
): Promise<SongWithMeta.Model[]> {
  if (params.songIds.length === 0) {
    return [];
  }

  const queryString = getQuery('getSongsByIds');

  return await handle
    .createQuery(queryString)
    .many(params, mapDecode(SongWithMeta.codec));
}

export async function songIdExists(
  handle: Handle,
  params: { songId: number }
): Promise<boolean> {
  const resp = await handle
    .createQuery('select * from songs where id=${songId}')
    .oneOrNone(params, () => true);

  return !!resp;
}
