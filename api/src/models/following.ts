import { db } from '../db';
import { createNotification } from './notifications';

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
