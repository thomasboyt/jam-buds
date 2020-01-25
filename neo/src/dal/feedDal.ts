import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { AggregatedPost } from './models';

interface GetAggregatedPostsForPublicFeed {
  beforeTimestamp: Date | null;
  afterTimestamp: Date | null;
  limit: number;
}

export async function getAggregatedPostsForPublicFeed(
  handle: Handle,
  params: GetAggregatedPostsForPublicFeed
): Promise<AggregatedPost.Model[]> {
  const queryString = getQuery('getAggregatedPostsForPublicFeed');

  return await handle
    .createQuery(queryString)
    .many(params, mapDecode(AggregatedPost.codec));
}
