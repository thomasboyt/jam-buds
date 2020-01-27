import { mapDecode, Handle } from '@tboyt/jareth';
import getQuery from './utils/getQuery';
import { User } from './models';

interface GetUserByAuthTokenParams {
  authToken: string;
}

export async function getUserByAuthTokenOrNull(
  handle: Handle,
  params: GetUserByAuthTokenParams
): Promise<User.Model | null> {
  const queryString = getQuery('getUserByAuthToken');

  return await handle
    .createQuery(queryString)
    .oneOrNone(params, mapDecode(User.codec));
}

interface GetUserByUserNameParams {
  userName: string;
}

export async function getUserByUserNameOrNull(
  handle: Handle,
  params: GetUserByUserNameParams
): Promise<User.Model | null> {
  const queryString = getQuery('getUserByUserName');

  return await handle
    .createQuery(queryString)
    .oneOrNone(params, mapDecode(User.codec));
}
