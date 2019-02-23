import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';
import { db } from '../db';
import genAuthToken from '../util/genAuthToken';
import validateOrThrow from '../util/validateOrThrow';
import { PublicUser, CurrentUser, UserProfile } from '../resources';
import { getFollowingForUserId } from './following';
import { getColorSchemeForUserId } from './colorSchemes';

export const UserModelV = t.type({
  id: t.number,
  authToken: t.string,
  name: t.string,
  email: t.string,
  twitterName: t.union([t.string, t.null]),
  twitterId: t.union([t.string, t.null]),
  twitterToken: t.union([t.string, t.null]),
  twitterSecret: t.union([t.string, t.null]),
  spotifyAccessToken: t.union([t.string, t.null]),
  spotifyRefreshToken: t.union([t.string, t.null]),
  spotifyExpiresAt: t.union([dateType, t.null]),
});

export type UserModel = t.TypeOf<typeof UserModelV>;

interface CreateUserOptions {
  name: string;
  email: string;
}

export async function createUser(opts: CreateUserOptions) {
  const authToken = await genAuthToken();

  const insert: Partial<UserModel> = {
    authToken,
    ...opts,
  };

  const query = db!
    .insert(insert)
    .returning('*')
    .into('users');

  const [row] = await query;
  const user = validateOrThrow(UserModelV, row);

  return user;
}

async function getUserWhere(params: Partial<UserModel>) {
  const query = db!('users').where(params);

  const [row] = await query;

  if (!row) {
    return null;
  }

  const user = validateOrThrow(UserModelV, row);

  return user;
}

export async function getUserByAuthToken(
  authToken: string
): Promise<UserModel | null> {
  return await getUserWhere({ authToken });
}

export async function getUserByTwitterId(
  twitterId: string
): Promise<UserModel | null> {
  return await getUserWhere({ twitterId });
}

export async function getUserByName(name: string): Promise<UserModel | null> {
  return await getUserWhere({ name });
}

export async function getUserByUserId(id: number): Promise<UserModel | null> {
  return await getUserWhere({ id });
}

export async function getUserByEmail(email: string): Promise<UserModel | null> {
  return await getUserWhere({ email });
}

// TODO: move to following.ts
export async function getUnfollowedUsersByTwitterIds(
  userId: number,
  twitterIds: string[]
): Promise<UserModel[]> {
  const followQuery = db!
    .select('followingId')
    .from('following')
    .where({ userId })
    .join('users', { 'users.id': 'following.following_id' });

  const query = db!
    .select('*')
    .from('users')
    .whereIn('twitterId', twitterIds)
    .where('id', 'not in', followQuery);

  const rows = await query;
  const users: UserModel[] = rows.map((row: any) =>
    validateOrThrow(UserModelV, row)
  );

  return users;
}

export async function getUserProfileForUser(
  user: UserModel
): Promise<UserProfile> {
  const colorScheme = await getColorSchemeForUserId(user.id);

  return {
    id: user.id,
    name: user.name,
    colorScheme,
  };
}

//
// Serialization methods
//

export function serializePublicUser(user: UserModel): PublicUser {
  return {
    id: user.id,
    name: user.name,
  };
}

export async function serializeCurrentUser(
  user: UserModel
): Promise<CurrentUser> {
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
) {
  return db!('users')
    .where({ id: user.id })
    .update(twitterParams);
}

export async function deleteTwitterCredentialsFromUser(user: UserModel) {
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

//
// Spotify credentials
//

interface SpotifyCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const toExpiresAt = (expiresInSec: number) =>
  new Date(Date.now() + expiresInSec * 1000);

export async function addSpotifyCredentialsToUser(
  user: UserModel,
  spotifyCredentials: SpotifyCredentials
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyRefreshToken: spotifyCredentials.refreshToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}

interface SpotifyRefreshCredentials {
  accessToken: string;
  expiresIn: number;
}

export async function updateRefreshedSpotifyCredentialsForUser(
  user: UserModel,
  spotifyCredentials: SpotifyRefreshCredentials
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}

export async function deleteSpotifyCredentialsFromUser(user: UserModel) {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: null,
    spotifyRefreshToken: null,
    spotifyExpiresAt: null,
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}
