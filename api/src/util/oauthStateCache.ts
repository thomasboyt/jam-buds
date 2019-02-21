import genAuthToken from './genAuthToken';

// TODO: put this in redis some day
const oauthCache: { [key: string]: string } = {};

export async function createOAuthState(redirect: string): Promise<string> {
  const stateToken = await genAuthToken();
  oauthCache[stateToken] = redirect;
  return stateToken;
}

export async function getAndClearOAuthState(
  stateToken: string
): Promise<string | undefined> {
  const entry = oauthCache[stateToken];
  delete oauthCache[stateToken];
  return entry;
}
