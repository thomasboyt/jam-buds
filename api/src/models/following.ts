import { db } from '../db';
import { camelizeKeys } from 'humps';
import { UserModel } from './user';

export async function followUser(userId: number, followingId: number) {
  const query = db!
    .insert({
      user_id: userId,
      following_id: followingId,
    })
    .into('following');

  await query;
}

export async function unfollowUser(userId: number, followingId: number) {
  const query = db!('following')
    .where({
      user_id: userId,
      following_id: followingId,
    })
    .delete();

  await query;
}

export async function getFollowingForUserId(
  userId: number
): Promise<UserModel[]> {
  const query = db!('following')
    .where({ user_id: userId })
    .join('users', { 'users.id': 'following.following_id' });

  const rows = await query;

  const users = rows.map((row: any) => camelizeKeys(row) as UserModel);

  return users;
}

export async function getFollowersForUserId(
  userId: number
): Promise<UserModel[]> {
  const query = db!('following')
    .where({ following_id: userId })
    .join('users', { 'users.id': 'following.user_id' });

  const rows = await query;

  const users = rows.map((row: any) => camelizeKeys(row) as UserModel);

  return users;
}
