import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';
import { db } from '../db';
import {
  PublicUser,
  CurrentUser,
  UserProfile,
  PublicUserWithTwitter,
} from '../resources';
import { getFollowingForUserId } from './following';
import { getColorSchemeForUserId } from './colorSchemes';
import { getNewNotificationsCount } from './notifications';
import { findOneOrThrow, findOne, findMany } from './utils';

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

interface CreateUserOptions {
  name: string;
  email: string;
  showInPublicFeed?: boolean;
}

export async function createUser(opts: CreateUserOptions): Promise<UserModel> {
  const query = db!
    .insert(opts)
    .returning('*')
    .into('users');

  return findOneOrThrow(query, UserModelV);
}

async function getUserWhere(
  params: Partial<UserModel>
): Promise<UserModel | null> {
  const query = db!('users').where(params);

  return findOne(query, UserModelV);
}

export async function getUserByAuthToken(
  authToken: string
): Promise<UserModel | null> {
  const query = db!('users')
    .join('auth_tokens', { 'users.id': 'auth_tokens.user_id' })
    .where({ authToken });

  return findOne(query, UserModelV);
}

export async function getUserByTwitterId(
  twitterId: string
): Promise<UserModel | null> {
  return getUserWhere({ twitterId });
}

export async function getUserByName(name: string): Promise<UserModel | null> {
  return getUserWhere({ name });
}

export async function getUserByUserId(id: number): Promise<UserModel | null> {
  return getUserWhere({ id });
}

export async function getUserByEmail(email: string): Promise<UserModel | null> {
  return getUserWhere({ email });
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

  return findMany(query, UserModelV);
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

export function serializePublicUserWithTwitterName(
  user: UserModel
): PublicUserWithTwitter {
  return {
    ...serializePublicUser(user),
    twitterName: user.twitterName,
  };
}

export async function serializeCurrentUser(
  user: UserModel
): Promise<CurrentUser> {
  const colorScheme = await getColorSchemeForUserId(user.id);
  const followingUsers = await getFollowingForUserId(user.id);
  const serializedUsers: PublicUser[] = followingUsers.map(serializePublicUser);
  const unreadNotificationCount = await getNewNotificationsCount(user.id);

  return {
    id: user.id,
    name: user.name,
    following: serializedUsers,
    colorScheme,
    twitterName: user.twitterName,
    showInPublicFeed: !!user.showInPublicFeed,
    email: user.email,
    unreadNotificationCount,
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

export async function setUserFeedToPublic(user: UserModel): Promise<void> {
  return db!('users')
    .where({ id: user.id })
    .update({ showInPublicFeed: true });
}

export async function setUserFeedToPrivate(user: UserModel): Promise<void> {
  return db!('users')
    .where({ id: user.id })
    .update({ showInPublicFeed: false });
}
