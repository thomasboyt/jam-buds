import * as t from 'io-ts';

export const codec = t.type({
  id: t.number,
  name: t.string,
  email: t.string,
  showInPublicFeed: t.union([t.boolean, t.null]),
  // TODO
});

export type Model = t.TypeOf<typeof codec>;
