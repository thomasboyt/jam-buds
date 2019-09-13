import Knex from 'knex';
import * as t from 'io-ts';
import { db } from '../db';
import { Song } from '../resources';
import validateOrThrow from '../util/validateOrThrow';
import { getOrCreateSongCacheEntryWithExternalIds } from '../util/songSearchCache';
import camelcaseKeys from 'camelcase-keys';

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

  let [row] = await query;

  if (!row) {
    return null;
  }

  return validateOrThrow(SongModelV, row);
}

export async function getSongBySpotifyId(
  spotifyId: string
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

/**
 * i'm not even sure what this is yet, some day this doc string should exist
 * though
 */
export function selectSongsQuery(
  baseQuery: Knex.QueryBuilder,
  opts: SongsQueryOptions
): Knex.QueryBuilder {
  /*
   * Note: the db!.raw('to_json') calls are used to "namespace" the results here
   * https://github.com/tgriesser/knex/issues/61#issuecomment-259176685
   * This may not be a great idea performance-wise.
   */
  return baseQuery.select([
    db!.raw('to_json(songs.*) as song'),
    ...getMetaQuery(opts),
  ]);
}

export function serializeSong(row: any): Song {
  const song = validateOrThrow(SongModelV, camelcaseKeys(row.song));
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

export async function getOrCreateSong(
  spotifyId: string
): Promise<SongModel | null> {
  // TODO: This should "upsert" from the search cache, I think? Would
  // basically allow for 'refreshing' of song details in some cases. Would
  // still have to match on Spotify ID, though.
  let song = await getSongBySpotifyId(spotifyId);

  if (song) {
    return song;
  }

  const searchCacheEntry = await getOrCreateSongCacheEntryWithExternalIds(
    spotifyId
  );

  if (!searchCacheEntry) {
    return null;
  }

  const spotifyResource = searchCacheEntry.spotify;

  const params = {
    spotifyId: spotifyResource.id,
    artists: spotifyResource.artists.map((artist) => artist.name),
    album: spotifyResource.album.name,
    title: spotifyResource.name,
    albumArt: spotifyResource.album.images[0].url,
    isrcId: searchCacheEntry.isrc,
    appleMusicId: searchCacheEntry.appleMusicId,
    appleMusicUrl: searchCacheEntry.appleMusicUrl,
  };

  return await createSong(params);
}

export async function hydrateSongMeta(
  song: SongModel,
  opts: SongsQueryOptions
): Promise<Song> {
  const [row] = await db!('songs')
    .select(getMetaQuery(opts))
    .where({ 'songs.id': song.id });

  const meta = validateOrThrow(SongMetaV, row);

  return {
    ...song,
    likeCount: parseInt(meta.likeCount),
    isLiked: meta.isLiked || false,
  };
}
