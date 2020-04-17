import { db } from '../db';

// TODO: It'd be nice to type-check per-type, so e.g. a follow notification
// requires a notification user ID
interface NotificationQueryOptions {
  type: 'like' | 'follow' | 'joined' | 'system';
  targetUserId?: number;
  notificationUserId?: number;
}

export async function createNotification(
  notificationQueryOpts: NotificationQueryOptions
): Promise<void> {
  // first make sure this notification doesn't already exist
  const [row] = await db!('notifications').where(notificationQueryOpts);

  if (row) {
    return;
  }

  await db!('notifications').insert(notificationQueryOpts);
}
