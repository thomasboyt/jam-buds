import Knex from 'knex';
import { db } from '../db';
import { camelizeKeys, decamelizeKeys } from 'humps';
import { Song } from '../resources';

export interface SongModel {
  id: number;
  artists: string[];
  title: string;
  albumArt: string | null;
  spotifyId: string | null;
  appleMusicId: string | null;
  isrcId: string | null;
  album: string | null;
}

export async function getSongById(id: number): Promise<SongModel | null> {
  const query = db!('songs').where({ id });

  let [row] = await query;

  if (!row) {
    return null;
  }

  const song = camelizeKeys(row) as SongModel;

  return song;
}

export async function getSongBySpotifyId(
  spotifyId: number
): Promise<SongModel | null> {
  const query = db!('songs').where({ spotify_id: spotifyId });

  let [row] = await query;

  if (!row) {
    return null;
  }

  const song = camelizeKeys(row) as SongModel;

  return song;
}

export async function createSong(
  params: Partial<SongModel>
): Promise<SongModel> {
  const query = db!
    .insert(decamelizeKeys(params))
    .returning('*')
    .into('songs');

  const [row] = await query;
  const song = camelizeKeys(row) as SongModel;

  return song;
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
  const song = camelizeKeys(row) as SongModel;

  return song;
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
