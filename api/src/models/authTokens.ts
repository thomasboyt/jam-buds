import * as t from 'io-ts';

import { db } from '../db';
import genAuthToken from '../util/genAuthToken';
import validateOrThrow from '../util/validateOrThrow';

export const AuthTokenModelV = t.type({
  authToken: t.string,
  userId: t.number,
});

export type AuthTokenModel = t.TypeOf<typeof AuthTokenModelV>;

export async function createAuthTokenForUserId(
  userId: number
): Promise<string> {
  const token = await genAuthToken();

  const query = db!
    .insert({ authToken: token, userId })
    .returning('*')
    .into('auth_tokens');

  const [row] = await query;
  const tokenModel = validateOrThrow(AuthTokenModelV, row);

  return tokenModel.authToken;
}

export async function deleteAuthToken(token: string): Promise<void> {
  const query = db!('auth_tokens')
    .delete()
    .where({ authToken: token });

  await query;
}
