import * as t from 'io-ts';
import { db } from '../db';
import { findOne } from './utils';

export const UserModelV = t.type({
  id: t.number,
  name: t.string,
  email: t.string,
  twitterName: t.union([t.string, t.null]),
  twitterId: t.union([t.string, t.null]),
  twitterToken: t.union([t.string, t.null]),
  twitterSecret: t.union([t.string, t.null]),
  showInPublicFeed: t.union([t.boolean, t.null]),
});

export type UserModel = t.TypeOf<typeof UserModelV>;

export async function getUserByAuthToken(
  authToken: string
): Promise<UserModel | null> {
  const query = db!('users')
    .join('auth_tokens', { 'users.id': 'auth_tokens.user_id' })
    .where({ authToken });

  return findOne(query, UserModelV);
}

//
// Twitter credentials
//

interface UpdateTwitterCredentialsOptions extends Partial<UserModel> {
  twitterId: string;
  twitterName: string;
  twitterToken: string;
  twitterSecret: string;
}

export async function updateTwitterCredentials(
  user: UserModel,
  twitterParams: UpdateTwitterCredentialsOptions
): Promise<void> {
  return db!('users')
    .where({ id: user.id })
    .update(twitterParams);
}

export async function deleteTwitterCredentialsFromUser(
  user: UserModel
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    twitterId: null,
    twitterName: null,
    twitterSecret: null,
    twitterToken: null,
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}
