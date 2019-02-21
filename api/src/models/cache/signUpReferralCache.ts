import { redis } from '../../redis';

const key = (token: string): string => `sign_up_referral:${token}`;
const EXPIRE_TIME_SEC = 24 * 60 * 60;

export async function setSignUpReferral(token: string, referral: string) {
  await redis!.set(key(token), referral);
  await redis!.expire(key(token), EXPIRE_TIME_SEC);
}

export async function getAndClearSignUpReferral(
  token: string
): Promise<string | null> {
  const referral = await redis!.get(key(token));
  await redis!.del(key(token));
  return referral;
}
