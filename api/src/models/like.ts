import { db } from '../db';
import { paginate } from './utils';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { selectSongsQuery, serializeSong } from './song';
import { UserSongItem } from '../resources';

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

function serializeLike(row: any): UserSongItem {
  const song = serializeSong(row);

  return {
    song,
    timestamp: row.timestamp.toISOString(),
  };
}

interface GetLikesOptions {
  currentUserId: number | undefined;
  beforeTimestamp?: string;
  afterTimestamp?: string;
}

export async function getLikesByUserId(
  userId: number,
  opts: GetLikesOptions
): Promise<UserSongItem[]> {
  const { currentUserId } = opts;

  const query = selectSongsQuery(db!('likes'), { currentUserId })
    .select([db!.raw('likes.created_at as timestamp')])
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
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'likes.created_at',
  });

  return rows.map(serializeLike);
}
