import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';
import slugify from '@sindresorhus/slugify';

import { db } from '../db';
import { UserModel } from './user';
import { DraftMixtapeListItem } from '../resources';
import { findMany, findOneOrThrow } from './utils';

export const MixtapeModelV = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  userId: t.number,
  createdAt: dateType,
  publishedAt: t.union([dateType, t.null]),
});

type MixtapeModel = t.TypeOf<typeof MixtapeModelV>;

const slugifyTitle = (title: string): string =>
  slugify(title, { decamelize: false });

interface CreateMixtapeOptions {
  title: string;
}

/**
 * Create a mixtape for a given user.
 *
 * Returns the mixtape model so the app can redirect to /mixtapes/:id/:slug.
 */
export async function createMixtapeForUser(
  user: UserModel,
  options: CreateMixtapeOptions
): Promise<MixtapeModel> {
  const slug = slugifyTitle(options.title);

  const query = db!('mixtapes')
    .insert({
      title: options.title,
      userId: user.id,
      slug,
    })
    .returning('*');

  const mixtape = await findOneOrThrow(query, MixtapeModelV);

  return mixtape;
}

/**
 * Add a song to a mixtape.
 */
export async function addSongToMixtape(
  mixtapeId: number,
  songId: number
): Promise<void> {
  const [row] = await db!('mixtape_song_entries')
    .where({ mixtapeId })
    .max('rank');

  const prevMax = row.max;

  await db!('mixtape_song_entries').insert({
    mixtapeId,
    songId,
    rank: (prevMax || 0) + 1,
  });
}

/**
 * Publish a mixtape, which allows it to be included in the feed.
 */
export async function publishMixtape(mixtapeId: number): Promise<void> {
  await db!.transaction(async (trx) => {
    const [row] = await trx!('mixtapes')
      .where({ id: mixtapeId })
      .update({ publishedAt: new Date() })
      .returning('*');

    await trx!('posts').insert({ userId: row.userId, mixtapeId });
  });
}

export async function getDraftMixtapesByUserId(
  userId: number
): Promise<DraftMixtapeListItem[]> {
  const query = db!('mixtapes')
    .select('*')
    .where({
      'mixtapes.user_id': userId,
      'mixtapes.published_at': null,
    })
    .orderBy('mixtapes.created_at', 'desc');

  const mixtapes = await findMany(query, MixtapeModelV);

  return mixtapes.map((mixtape: t.TypeOf<typeof MixtapeModelV>) => {
    return {
      id: mixtape.id,
      title: mixtape.title,
      slug: mixtape.slug,
    };
  });
}
