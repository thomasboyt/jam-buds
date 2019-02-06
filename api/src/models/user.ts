import { db } from '../db';
import genAuthToken from '../util/genAuthToken';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { PublicUser, CurrentUser, UserProfile } from '../resources';
import { getFollowingForUserId } from './following';
import { getColorSchemeForUserId } from './colorSchemes';

export interface User {
  id: number;
  authToken: string;
  name: string;
  email?: string;
  twitterName?: string;
  twitterId?: string;
  twitterToken?: string;
  twitterSecret?: string;
}

export function serializePublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
  };
}

interface CreateUserOptions {
  name: string;
}

async function createUser(opts: CreateUserOptions) {
  const authToken = await genAuthToken();

  const insert = Object.assign({ authToken }, opts);

  const query = db!
    .insert(decamelizeKeys(insert))
    .returning('*')
    .into('users');

  const [row] = await query;
  const user = camelizeKeys(row) as User;

  return user;
}

interface CreateUserFromTwitterOptions extends CreateUserOptions {
  twitterId: string;
  twitterName: string;
  twitterToken: string;
  twitterSecret: string;
}

export async function createUserFromTwitter(
  opts: CreateUserFromTwitterOptions
): Promise<User> {
  return createUser(opts);
}

interface CreateUserFromEmailOptions extends CreateUserOptions {
  email: string;
}

export async function createUserFromEmail(
  opts: CreateUserFromEmailOptions
): Promise<User> {
  return createUser(opts);
}

interface UpdateTwitterCredentialsOptions {
  twitterId: string;
  twitterToken: string;
  twitterSecret: string;
}

export async function updateTwitterCredentials(
  opts: UpdateTwitterCredentialsOptions
) {
  const { twitterId, twitterToken, twitterSecret } = opts;

  return db!('users')
    .where({ twitter_id: twitterId })
    .update(decamelizeKeys({ twitterSecret, twitterToken }));
}

async function getUserWhere(params: any) {
  const query = db!('users').where(params);

  const [row] = await query;

  if (!row) {
    return null;
  }

  const user = camelizeKeys(row) as User;

  return user;
}

export async function getUserByAuthToken(
  authToken: string
): Promise<User | null> {
  return await getUserWhere({ auth_token: authToken });
}

export async function getUserByTwitterId(id: string): Promise<User | null> {
  return await getUserWhere({ twitter_id: id });
}

export async function getUserByName(name: string): Promise<User | null> {
  return await getUserWhere({ name });
}

export async function getUserByUserId(id: number): Promise<User | null> {
  return await getUserWhere({ id });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await getUserWhere({ email });
}

export async function getUnfollowedUsersByTwitterIds(
  userId: number,
  twitterIds: string[]
): Promise<User[]> {
  const followQuery = db!
    .select('following_id')
    .from('following')
    .where({ user_id: userId })
    .join('users', { 'users.id': 'following.following_id' });

  const query = db!
    .select('*')
    .from('users')
    .whereIn('twitter_id', twitterIds)
    .where('id', 'not in', followQuery);

  const rows = await query;
  const users: User[] = rows.map((row: any) => camelizeKeys(row));

  return users;
}

export async function getUserProfileForUser(user: User): Promise<UserProfile> {
  const colorScheme = await getColorSchemeForUserId(user.id);

  return {
    id: user.id,
    name: user.name,
    colorScheme,
  };
}

export async function serializeCurrentUser(user: User): Promise<CurrentUser> {
  const colorScheme = await getColorSchemeForUserId(user.id);
  const followingUsers = await getFollowingForUserId(user.id);
  const serializedUsers: PublicUser[] = followingUsers.map(serializePublicUser);

  return {
    id: user.id,
    name: user.name,
    following: serializedUsers,
    colorScheme,
    hasTwitter: !!user.twitterId,
  };
}
