import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';
import camelcaseKeys from 'camelcase-keys';

import { db } from '../db';
import { serializePublicUser, UserModelV } from './user';
import { Post } from '../resources';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { joinSongsQuery, serializeSong, SongModelV } from './song';
import { paginate } from './utils';
import validateOrThrow from '../util/validateOrThrow';

export const PostModelV = t.type({
  id: t.number,
  songId: t.number,
  userId: t.number,
  createdAt: dateType,
});

export type PostModel = t.TypeOf<typeof PostModelV>;

export interface CreatePostParams {
  userId: number;
  songId: number;
}

// XXX: Post is a weird "model" because it's basically only ever serialized
// along with the song and user it's associated with. This sort of exposes how
// awkward the "model" interfaces are (and how they should really be named
// "Schema" or "Table") or something, and the potential for higher-level models.
// Or, y'know, an ORM. Or Prisma?

export async function createPost(values: CreatePostParams): Promise<Post> {
  const query = db!
    .insert(values)
    .into('posts')
    .returning('id');

  const [id] = await query;
  const post = await getPostById(id);

  return post!;
}

function serializePost(row: any): Post {
  const { isLiked } = row;
  const post = validateOrThrow(
    PostModelV,
    camelcaseKeys({
      ...row.post,
      // XXX: okay, so, this is really weird, but: `createdAt` gets converted
      // into a string when to_json() is used to namespace the table, because
      // the to_json solution is a completely garbage hack that should die in a
      // fire. This is the worst.
      createdAt: new Date(row.post.created_at),
    })
  );
  const song = serializeSong(
    validateOrThrow(SongModelV, camelcaseKeys(row.song)),
    isLiked
  );
  const user = serializePublicUser(
    validateOrThrow(UserModelV, camelcaseKeys(row.user))
  );

  return {
    id: post.id,
    added: post.createdAt.toISOString(),
    song: song,
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
