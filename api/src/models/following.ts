import { db } from '../db';
import { UserModel, UserModelV } from './user';
import { createNotification, deleteNotification } from './notifications';
import { findMany } from './utils';

export async function followUser(userId: number, followingId: number) {
  const query = db!
    .insert({
      user_id: userId,
      following_id: followingId,
    })
    .into('following');

  await query;

  await createNotification({
    type: 'follow',
    targetUserId: followingId,
    notificationUserId: userId,
  });
}

export async function unfollowUser(userId: number, followingId: number) {
  const query = db!('following')
    .where({
      user_id: userId,
      following_id: followingId,
    })
    .delete();

  await query;

  await deleteNotification({
    type: 'follow',
    targetUserId: followingId,
    notificationUserId: userId,
  });
}

export async function getFollowingForUserId(
  userId: number
): Promise<UserModel[]> {
  const query = db!('following')
    .where({ user_id: userId })
    .join('users', { 'users.id': 'following.following_id' });

  return findMany(query, UserModelV);
}

export async function getFollowersForUserId(
  userId: number
): Promise<UserModel[]> {
  const query = db!('following')
    .where({ following_id: userId })
    .join('users', { 'users.id': 'following.user_id' });

  return findMany(query, UserModelV);
}
