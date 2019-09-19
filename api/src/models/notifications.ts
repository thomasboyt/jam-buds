import { db } from '../db';
import { Notification } from '../resources';
import { serializePublicUser } from './user';

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

export async function deleteNotification(
  notificationQueryOpts: NotificationQueryOptions
): Promise<void> {
  await db!('notifications')
    .where(notificationQueryOpts)
    .delete();
}

export async function getNewNotificationsCount(
  userId: number
): Promise<number> {
  const [countObj] = await db!('notifications')
    .where({ targetUserId: userId, read: false })
    .count();

  const count = parseInt(countObj.count);

  return count;
}

export async function getNewNotifications(
  userId: number
): Promise<Notification[]> {
  const rows = await db!('notifications')
    .select(
      '*',
      db!.raw('to_json(songs.*) as song'),
      db!.raw('to_json(users.*) as user')
    )
    .where({
      targetUserId: userId,
      read: false,
    })
    .leftJoin('songs', 'notifications.notification_song_id', 'songs.id')
    .leftJoin('users', 'notifications.notification_user_id', 'users.id')
    .orderBy('notifications.created_at', 'desc');

  return rows.map((row) => serializeNotification(row));
}

export async function markNotificationsAsRead(userId: number): Promise<void> {
  await db!('notifications')
    .where({ targetUserId: userId, read: false })
    .update({ read: true });
}

// TODO: type-check row
function serializeNotification(row: any): Notification {
  if (row.type === 'follow') {
    return {
      id: row.id,
      type: 'follow',
      user: serializePublicUser(row.user),
    };
  } else {
    throw new Error(
      `notification serialization not yet implemented for type ${row.type}`
    );
  }
}
