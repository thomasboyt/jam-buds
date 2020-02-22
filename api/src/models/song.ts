import Knex from 'knex';
import * as t from 'io-ts';
import { db } from '../db';
import { Song } from '../resources';
import validateOrThrow from '../util/validateOrThrow';
import { selectNamespacedModel, findOne, findOneOrThrow } from './utils';

export const SongModelV = t.type({
  id: t.number,
  artists: t.array(t.string),
  title: t.string,
  albumArt: t.union([t.string, t.null]),
  spotifyId: t.union([t.string, t.null]),
  appleMusicId: t.union([t.string, t.null]),
  appleMusicUrl: t.union([t.string, t.null]),
  isrcId: t.union([t.string, t.null]),
  album: t.union([t.string, t.null]),
});

export const SongMetaV = t.type({
  isLiked: t.union([t.boolean, t.undefined]),
  // XXX: This is a string and not a number because SELECT COUNT(*) in postgres
  // returns a bigint, which node-postgres serializes as a string
  likeCount: t.string,
});

export type SongModel = t.TypeOf<typeof SongModelV>;

export async function getSongById(id: number): Promise<SongModel | null> {
  const query = db!('songs').where({ id });
  const song = await findOne(query, SongModelV);
  return song;
}

export async function getSongBySpotifyId(
  spotifyId: string
): Promise<SongModel | null> {
  const query = db!('songs').where({ spotify_id: spotifyId });
  const song = await findOne(query, SongModelV);
  return song;
}

export async function createSong(
  params: Partial<SongModel>
): Promise<SongModel> {
  const query = db!
    .insert(params)
    .returning('*')
    .into('songs');

  const song = await findOneOrThrow(query, SongModelV);
  return song;
}

interface SongsQueryOptions {
  currentUserId?: number;
}

export function getMetaQuery(opts: SongsQueryOptions): Knex.Raw[] {
  const query = [
    db!.raw(
      '(SELECT COUNT(*) FROM likes WHERE likes.song_id=songs.id) as like_count'
    ),
  ];

  if (opts.currentUserId) {
    query.push(
      db!.raw(
        'EXISTS(SELECT 1 FROM likes WHERE likes.user_id=? AND likes.song_id=songs.id) AS is_liked',
        [opts.currentUserId]
      )
    );
  }

  return query;
}

export function selectSongs(opts: SongsQueryOptions) {
  return [
    selectNamespacedModel(SongModelV, 'songs', 'song'),
    ...getMetaQuery(opts),
  ];
}

export function serializeSong(row: any): Song {
  const song = validateOrThrow(SongModelV, row.song);
  const meta = validateOrThrow(SongMetaV, row);

  return {
    id: song.id,
    album: song.album,
    artists: song.artists,
    title: song.title,
    albumArt: song.albumArt,
    spotifyId: song.spotifyId,
    appleMusicId: song.appleMusicId,
    appleMusicUrl: song.appleMusicUrl,
    isLiked: meta.isLiked || false,
    likeCount: parseInt(meta.likeCount),
  };
}
