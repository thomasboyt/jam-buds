import { db } from '../db';

interface LikeModel {
  id: number;
  userId: number;
  songId: number;
}

interface LikeParams extends Partial<LikeModel> {
  userId: number;
  songId: number;
}

export async function createLike(params: LikeParams): Promise<void> {
  const query = db!('likes').insert({
    song_id: params.songId,
    user_id: params.userId,
  });

  await query;
}

export async function likeExists(params: LikeParams): Promise<boolean> {
  const query = db!('likes').where({
    song_id: params.songId,
    user_id: params.userId,
  });

  const [row] = await query;

  return !!row;
}

export async function removeLike(params: LikeParams): Promise<void> {
  const query = db!('likes')
    .where({
      song_id: params.songId,
      user_id: params.userId,
    })
    .delete();

  await query;
}
