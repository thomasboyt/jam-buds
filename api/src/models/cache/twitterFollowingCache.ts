import { redis } from '../../redis';

// Caches the Twitter IDs that a user follows, for use in the find friends
// pages. Twitter rate-limits this pretty harshly per 15 minute window, so we do
// a 15-minute expiration.

const key = (userId: number): string => `twitter_friends:${userId}`;
const EXPIRE_TIME_SEC = 60 * 15;

export async function setTwitterFollowingCache(
  userId: number,
  twitterIds: string[]
) {
  await redis!.set(key(userId), JSON.stringify(twitterIds));
  await redis!.expire(key(userId), EXPIRE_TIME_SEC);
}

export async function getTwitterFollowingCache(
  userId: number
): Promise<string[] | null> {
  const following = await redis!.get(key(userId));

  if (!following) {
    return null;
  }

  return JSON.parse(following);
}
