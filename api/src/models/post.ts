import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

import { db } from '../db';
import { Song } from '../resources';
import { selectSongsQuery, serializeSong } from './song';

export const PostModelV = t.type({
  id: t.number,
  songId: t.number,
  userId: t.number,
  createdAt: dateType,
});

/**
 * The underlying `post` table.
 */
export type PostModel = t.TypeOf<typeof PostModelV>;

export interface PostSongParams {
  userId: number;
  songId: number;
}

export async function postSong(values: PostSongParams): Promise<Song> {
  await db!.insert(values).into('posts');

  const [row] = await selectSongsQuery(db!('songs'), {
    currentUserId: values.userId,
  }).where({ id: values.songId });

  return serializeSong(row);
}

interface GetOwnPostForSongIdOptions {
  userId: number;
  songId: number;
}

/**
 * Returns a raw `PostModel`.
 */
export async function getOwnPostForSongId(
  opts: GetOwnPostForSongIdOptions
): Promise<PostModel | null> {
  const query = db!('posts').where({
    songId: opts.songId,
    userId: opts.userId,
  });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return rows[0];
}

export async function deletePostById(id: number): Promise<void> {
  const query = db!('posts')
    .where({ id })
    .delete();

  await query;
}
