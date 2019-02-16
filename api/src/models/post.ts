import { db } from '../db';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { User, serializePublicUser } from './user';
import { Post } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { joinSongsQuery, serializeSong } from './song';
import { paginate } from './utils';

export interface CreatePostParams {
  userId: number;
  songId: number;
  note: string;
}

export async function createPost(values: CreatePostParams): Promise<Post> {
  const query = db!
    .insert(decamelizeKeys(values))
    .into('posts')
    .returning('id');

  const [id] = await query;
  const post = await getPostById(id);

  return post!;
}

function serializePost(row: any): Post {
  const { song, isLiked, post } = camelizeKeys(row) as any;
  const user = serializePublicUser(camelizeKeys(row.user) as User);

  return {
    id: post.id,

    note: post.note,
    added: post.createdAt,

    song: serializeSong(song, isLiked),
    user,
  };
}

interface QueryOptions {
  currentUserId?: number;
  previousId?: number;
}

function getBasePostsQuery(opts: QueryOptions) {
  /*
   * Note: the db!.raw('to_json') calls are used to "namespace" the results here
   * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
   * This may not be a great idea performance-wise.
   */

  let query = db!('posts')
    .select(db!.raw('to_json(posts.*) as post'))
    .join('users', {
      'users.id': 'posts.user_id',
    });

  return paginate(joinSongsQuery(query, opts), {
    limit: ENTRY_PAGE_LIMIT,
    previousId: opts.previousId,
    idColumn: 'posts.id',
  }).join('songs', {
    'songs.id': 'posts.song_id',
  });
}

export async function getPostsByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<Post[]> {
  const query = getBasePostsQuery(opts)
    .where({ user_id: id })
    .orderBy('posts.id', 'desc');

  const rows = await query;

  return rows.map((row: any) => serializePost(row));
}

/**
 * "Feed" is a list of posts, so it's here for convenience.
 */
export async function getFeedByUserId(
  id: number,
  opts: QueryOptions = {}
): Promise<Post[]> {
  opts.currentUserId = id;

  const query = getBasePostsQuery(opts)
    .where(function() {
      this.whereIn('user_id', function() {
        this.select('following_id')
          .from('following')
          .where({ user_id: id });
      }).orWhere({ user_id: id });
    })
    .orderBy('posts.id', 'desc');

  const rows = await query;

  return rows.map((row: any) => serializePost(row));
}

export async function getPostById(
  id: number,
  opts: QueryOptions = {}
): Promise<Post | null> {
  const query = getBasePostsQuery(opts).where({ 'posts.id': id });

  const rows = await query;

  if (!rows[0]) {
    return null;
  }

  return serializePost(rows[0]);
}

export async function deletePostById(id: number): Promise<void> {
  const query = db!('posts')
    .where({ id })
    .delete();

  await query;
}
