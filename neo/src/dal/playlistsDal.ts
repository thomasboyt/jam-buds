import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { UserPost } from './models';

interface GetPostsForUser {
  userId: number;
  beforeTimestamp: Date | null;
  afterTimestamp: Date | null;
  limit: number;
}

interface MixtapesOption {
  onlyMixtapes: boolean;
}

export async function getPostsForUser(
  handle: Handle,
  params: GetPostsForUser & MixtapesOption
): Promise<UserPost.Model[]> {
  const queryString = getQuery('getPostsForUserPlaylist');

  return await handle
    .createQuery(queryString)
    .manyOrNone(params, mapDecode(UserPost.codec));
}

export async function getLikedPostsForUser(
  handle: Handle,
  params: GetPostsForUser
): Promise<UserPost.Model[]> {
  const queryString = getQuery('getLikedPostsForUserPlaylist');

  return await handle
    .createQuery(queryString)
    .manyOrNone(params, mapDecode(UserPost.codec));
}
