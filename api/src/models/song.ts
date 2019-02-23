import Knex from 'knex';
import * as t from 'io-ts';
import { db } from '../db';
import { Song } from '../resources';
import validateOrThrow from '../util/validateOrThrow';

export const SongModelV = t.type({
  id: t.number,
  artists: t.array(t.string),
  title: t.string,
  albumArt: t.union([t.string, t.null]),
  spotifyId: t.union([t.string, t.null]),
  appleMusicId: t.union([t.string, t.null]),
  isrcId: t.union([t.string, t.null]),
  album: t.union([t.string, t.null]),
});

export type SongModel = t.TypeOf<typeof SongModelV>;

export async function getSongById(id: number): Promise<SongModel | null> {
  const query = db!('songs').where({ id });

  let [row] = await query;

  if (!row) {
    return null;
  }

  return validateOrThrow(SongModelV, row);
}

export async function getSongBySpotifyId(
  spotifyId: number
): Promise<SongModel | null> {
  const query = db!('songs').where({ spotify_id: spotifyId });

  let [row] = await query;

  if (!row) {
    return null;
  }

  return validateOrThrow(SongModelV, row);
}

export async function createSong(
  params: Partial<SongModel>
): Promise<SongModel> {
  const query = db!
    .insert(params)
    .returning('*')
    .into('songs');

  const [row] = await query;
  return validateOrThrow(SongModelV, row);
}

export async function createSongFromManualEntry(
  artist: string,
  title: string
): Promise<SongModel> {
  const values = {
    artists: [artist],
    title: title,
  };

  const query = db!
    .insert(values)
    .returning('*')
    .into('songs');

  const [row] = await query;
  return validateOrThrow(SongModelV, row);
}

interface SongsQueryOptions {
  currentUserId?: number;
}

/**
 * i'm not even sure what this is yet, some day this doc string should exist
 * though
 */
export function joinSongsQuery(
  baseQuery: Knex.QueryBuilder,
  opts: SongsQueryOptions
): Knex.QueryBuilder {
  /*
   * Note: the db!.raw('to_json') calls are used to "namespace" the results here
   * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
   * This may not be a great idea performance-wise.
   */

  const select = [
    db!.raw('to_json(songs.*) as song'),
    db!.raw('to_json(users.*) as user'),
  ];

  if (opts.currentUserId !== undefined) {
    select.push(
      db!.raw(
        'EXISTS(SELECT 1 FROM likes WHERE user_id=? AND song_id=songs.id) AS is_liked',
        [opts.currentUserId]
      )
    );
  }

  return baseQuery.select(select);
}

export function serializeSong(song: SongModel, isLiked: boolean): Song {
  return {
    id: song.id,
    album: song.album,
    artists: song.artists,
    title: song.title,
    albumArt: song.albumArt,
    spotifyId: song.spotifyId,
    appleMusicId: song.appleMusicId,
    isLiked,
  };
}
