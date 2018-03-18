import {db} from '../db';
import {camelizeKeys} from 'humps';
import {User} from './user';

export async function followUser(userId: number, followingId: number) {
  const query = db!.insert({
    user_id: userId,
    following_id: followingId,
  }).into('following');

  await (query as any);
}

export async function unfollowUser(userId: number, followingId: number) {
  const query = db!('following').where({
    user_id: userId,
    following_id: followingId,
  }).delete();

  await (query as any);
}

export async function getFollowingForUserId(userId: number): Promise<User[]> {
  const query =
    db!('following')
    .where({user_id: userId})
    .join('users', {'users.id': 'following.following_id'});

  const rows = await (query as any);

  const users = rows.map((row: any) => camelizeKeys(row) as User);

  return users;
}

export async function getFollowersForUserId(userId: number): Promise<User[]> {
  const query =
    db!('following')
    .where({following_id: userId})
    .join('users', {'users.id': 'following.user_id'});

  const rows = await (query as any);

  const users = rows.map((row: any) => camelizeKeys(row) as User);

  return users;
}