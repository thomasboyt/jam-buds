import * as t from 'io-ts';

export const codec = t.type({
  id: t.number,
  userId: t.number,
  textColor: t.string,
  backgroundGradientName: t.string,
});

export type Model = t.TypeOf<typeof codec>;
