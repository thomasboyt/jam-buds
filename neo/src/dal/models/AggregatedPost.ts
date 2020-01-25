import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

export const codec = t.type({
  timestamp: dateType,
  userNames: t.array(t.string),
  songId: t.union([t.number, t.null]),
  mixtapeId: t.union([t.number, t.null]),
});

export type Model = t.TypeOf<typeof codec>;
