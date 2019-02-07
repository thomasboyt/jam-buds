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
  email: string;
  twitterName: string | null;
  twitterId: string | null;
  twitterToken: string | null;
  twitterSecret: string | null;
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  spotifyExpiresAt: Date | null;
}

export function serializePublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
  };
}

interface CreateUserOptions {
  name: string;
  email: string;
}

export async function createUser(opts: CreateUserOptions) {
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

interface UpdateTwitterCredentialsOptions {
  twitterId: string;
  twitterName: string;
  twitterToken: string;
  twitterSecret: string;
}

export async function updateTwitterCredentials(
  user: User,
  twitterParams: UpdateTwitterCredentialsOptions
) {
  return db!('users')
    .where({ id: user.id })
    .update(decamelizeKeys(twitterParams));
}

export async function deleteTwitterCredentialsFromUser(user: User) {
  const updateParams: Partial<User> = {
    twitterId: null,
    twitterName: null,
    twitterSecret: null,
    twitterToken: null,
  };

  return db!('users')
    .where({ id: user.id })
    .update(decamelizeKeys(updateParams));
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
    twitterName: user.twitterName,
    hasSpotify: !!user.spotifyAccessToken,
  };
}

interface SpotifyCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const toExpiresAt = (expiresInSec: number) =>
  new Date(Date.now() + expiresInSec * 1000);

export async function addSpotifyCredentialsToUser(
  user: User,
  spotifyCredentials: SpotifyCredentials
): Promise<void> {
  const updateParams: Partial<User> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyRefreshToken: spotifyCredentials.refreshToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(decamelizeKeys(updateParams));
}

interface SpotifyRefreshCredentials {
  accessToken: string;
  expiresIn: number;
}

export async function updateRefreshedSpotifyCredentialsForUser(
  user: User,
  spotifyCredentials: SpotifyRefreshCredentials
): Promise<void> {
  const updateParams: Partial<User> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(decamelizeKeys(updateParams));
}

export async function deleteSpotifyCredentialsFromUser(user: User) {
  const updateParams: Partial<User> = {
    spotifyAccessToken: null,
    spotifyRefreshToken: null,
    spotifyExpiresAt: null,
  };

  return db!('users')
    .where({ id: user.id })
    .update(decamelizeKeys(updateParams));
}
