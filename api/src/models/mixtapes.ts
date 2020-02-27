import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

import { db } from '../db';
import { DraftMixtapeListItem } from '../resources';
import { findMany } from './utils';

export const MixtapeModelV = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  userId: t.number,
  createdAt: dateType,
  publishedAt: t.union([dateType, t.null]),
});

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
