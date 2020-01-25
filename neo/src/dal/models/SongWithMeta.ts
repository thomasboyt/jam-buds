import * as t from 'io-ts';

export const codec = t.type({
  id: t.number,
  artists: t.array(t.string),
  title: t.string,
  albumArt: t.union([t.string, t.null]),
  spotifyId: t.union([t.string, t.null]),
  appleMusicId: t.union([t.string, t.null]),
  appleMusicUrl: t.union([t.string, t.null]),
  isrcId: t.union([t.string, t.null]),
  album: t.union([t.string, t.null]),
  isLiked: t.boolean,
  // XXX: This is a string and not a number because SELECT COUNT(*) in postgres
  // returns a bigint, which node-postgres serializes as a string
  likeCount: t.string,
});

export type Model = t.TypeOf<typeof codec>;
