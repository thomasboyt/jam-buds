import { redis } from '../../redis';
import genAuthToken from '../../util/genAuthToken';

const key = (token: string): string => `oauthState:${token}`;
const EXPIRE_TIME_SEC = 24 * 60; // 1 hour

export async function createOAuthState(redirect: string): Promise<string> {
  const token = await genAuthToken();
  await redis!.set(key(token), redirect);
  await redis!.expire(key(token), EXPIRE_TIME_SEC);
  return token;
}

export async function getAndClearOAuthState(
  token: string
): Promise<string | null> {
  const redirect = await redis!.get(key(token));
  await redis!.del(key(token));
  return redirect;
}
