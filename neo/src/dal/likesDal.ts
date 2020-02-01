import { Handle } from '@tboyt/jareth';

export async function songLikeExists(
  handle: Handle,
  params: { userId: number; songId: number }
): Promise<boolean> {
  const resp = await handle
    .createQuery(
      'select * from likes where song_id=${songId} and user_id=${userId}'
    )
    .oneOrNone(params, () => true);

  return !!resp;
}

export function createSongLike(
  handle: Handle,
  params: { userId: number; songId: number }
): Promise<void> {
  return handle
    .createQuery(
      'insert into likes (user_id, song_id) values (${userId}, ${songId})'
    )
    .none(params);
}

export function deleteSongLike(
  handle: Handle,
  params: { userId: number; songId: number }
): Promise<void> {
  return handle
    .createQuery(
      'delete from likes where user_id=${userId} and song_id=${songId}'
    )
    .none(params);
}
