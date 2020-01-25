import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

export const codec = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  userId: t.number,
  createdAt: dateType,
  publishedAt: t.union([dateType, t.null]),
  songCount: t.string,
  authorName: t.string,
});

export type Model = t.TypeOf<typeof codec>;
