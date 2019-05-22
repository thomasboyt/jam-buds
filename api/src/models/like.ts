import { db } from '../db';
import { paginate } from './utils';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { joinSongsQuery, serializeSong, SongModelV } from './song';
import { LikeEntry } from '../resources';
import validateOrThrow from '../util/validateOrThrow';
import camelcaseKeys from 'camelcase-keys';

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

  let [row] = await query;

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

interface GetLikesOptions {
  currentUserId: number | undefined;
  previousId?: number;
}

function serializeLike(row: any): LikeEntry {
  const song = serializeSong(
    validateOrThrow(SongModelV, camelcaseKeys(row.song)),
    row.isLiked
  );

  return {
    song,
    timestamp: row.like.created_at,
  };
}

export async function getLikesByUserId(
  userId: number,
  opts: GetLikesOptions
): Promise<LikeEntry[]> {
  const { currentUserId, previousId } = opts;

  const query = joinSongsQuery(db!('likes'), { currentUserId })
    .select(db!.raw('to_json(likes.*) as like'))
    .join('songs', {
      'songs.id': 'likes.song_id',
    })
    .join('users', {
      'users.id': 'likes.user_id',
    })
    .where({
      user_id: userId,
    })
    .orderBy('likes.id', 'desc');

  const rows = await paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    previousId,
    idColumn: 'likes.id',
  });

  return rows.map(serializeLike);
}
