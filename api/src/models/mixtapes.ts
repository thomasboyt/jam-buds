import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';
import slugify from '@sindresorhus/slugify';

import { db } from '../db';
import { UserModel, getUserProfileForUser, getUserByUserId } from './user';
import { serializeSong, selectSongs, SongWithMetaModelV } from './song';
import { Mixtape, Song, DraftMixtapeListItem } from '../resources';
import { findMany, findOne, findOneOrThrow, selectModelFields } from './utils';

export const MixtapeModelV = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  userId: t.number,
  createdAt: dateType,
  publishedAt: t.union([dateType, t.null]),
});

export type MixtapeModel = t.TypeOf<typeof MixtapeModelV>;

export const MixtapeSongEntryModelV = t.type({
  songId: t.number,
  mixtapeId: t.number,
  rank: t.number,
});

export const MixtapePreviewModelV = t.intersection([
  MixtapeModelV,
  t.type({
    songCount: t.string,
    authorName: t.string,
  }),
]);

export type MixtapePreviewModel = t.TypeOf<typeof MixtapePreviewModelV>;

export function selectMixtapePreviews() {
  return [
    ...selectModelFields(MixtapeModelV, 'mixtapes'),
    db!.raw(
      '(SELECT users.name FROM users WHERE users.id=mixtapes.user_id) as "author_name"'
    ),
    db!.raw(
      '(SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id) as "song_count"'
    ),
  ];
}

const slugifyTitle = (title: string): string =>
  slugify(title, { decamelize: false });

interface CreateMixtapeOptions {
  title: string;
}

/**
 * Create a mixtape for a given user.
 *
 * Returns the mixtape model so the app can redirect to /mixtapes/:id/:slug.
 */
export async function createMixtapeForUser(
  user: UserModel,
  options: CreateMixtapeOptions
): Promise<MixtapeModel> {
  const slug = slugifyTitle(options.title);

  const query = db!('mixtapes')
    .insert({
      title: options.title,
      userId: user.id,
      slug,
    })
    .returning('*');

  const mixtape = await findOneOrThrow(query, MixtapeModelV);

  return mixtape;
}

/**
 * Set the title of a given mixtape.
 *
 * Returns the mixtape slug so the app can redirect to /mixtapes/:id/:slug.
 */
export async function setMixtapeTitle({
  mixtapeId,
  title,
}: {
  mixtapeId: number;
  title: string;
}): Promise<string> {
  const slug = slugifyTitle(title);

  await db!('mixtapes')
    .where({ id: mixtapeId })
    .update({ title, slug });

  return slug;
}

/**
 * Add a song to a mixtape.
 */
export async function addSongToMixtape(
  mixtapeId: number,
  songId: number
): Promise<void> {
  const [row] = await db!('mixtape_song_entries')
    .where({ mixtapeId })
    .max('rank');

  const prevMax = row.max;

  await db!('mixtape_song_entries').insert({
    mixtapeId,
    songId,
    rank: (prevMax || 0) + 1,
  });
}

/**
 * Remove a song from a mixtape. No-op if the song isn't present.
 */
export async function removeSongFromMixtape({
  mixtapeId,
  songId,
}: {
  mixtapeId: number;
  songId: number;
}): Promise<void> {
  await db!('mixtape_song_entries')
    .where({
      mixtapeId,
      songId,
    })
    .delete();
}

/**
 * Re-order a mixtape, updating each entry's `rank` by its position in the
 * `songIds[]` array.
 *
 * TODO: Throws an error if a song ID isn't present in the mixtape.
 */
export async function reorderMixtapeSongs({
  mixtapeId,
  songOrder,
}: {
  mixtapeId: number;
  songOrder: number[];
}): Promise<void> {
  await db!.transaction((trx) => {
    const updates = songOrder.map((songId, rank) => {
      return trx!
        .table('mixtape_song_entries')
        .update({ rank })
        .where({ mixtapeId, songId });
    });

    return Promise.all(updates);
  });
}

/**
 * Publish a mixtape, which allows it to be included in the feed.
 */
export async function publishMixtape(mixtapeId: number): Promise<void> {
  await db!.transaction(async (trx) => {
    const [row] = await trx!('mixtapes')
      .where({ id: mixtapeId })
      .update({ publishedAt: new Date() })
      .returning('*');

    await trx!('posts').insert({ userId: row.userId, mixtapeId });
  });
}

/**
 * Delete a mixtape and its associated mixtape_song_entries
 */
export async function deleteMixtape(mixtapeId: number): Promise<void> {
  await db!('mixtapes')
    .where({ id: mixtapeId })
    .delete();
}

/**
 * Get a mixtape by ID.
 */
export async function getMixtapeById(
  mixtapeId: number,
  songQueryOptions: { currentUserId?: number }
): Promise<Mixtape | null> {
  const mixtapeQuery = db!('mixtapes').where({ id: mixtapeId });
  const mixtapeModel = await findOne(mixtapeQuery, MixtapeModelV);

  if (!mixtapeModel) {
    return null;
  }

  const tracks = await getSongsByMixtapeId(mixtapeId, songQueryOptions);
  const authorUser = await getUserByUserId(mixtapeModel.userId);

  if (!authorUser) {
    throw new Error(`no user ${mixtapeModel.userId} for mixtape ${mixtapeId}`);
  }

  const author = await getUserProfileForUser(authorUser);
  const publishedAt = mixtapeModel.publishedAt;
  const serializedDate = publishedAt ? publishedAt.toISOString() : null;

  return {
    id: mixtapeModel.id,
    slug: mixtapeModel.slug,
    isPublished: !!mixtapeModel.publishedAt,
    publishedAt: serializedDate,
    title: mixtapeModel.title,
    tracks,
    author,
  };
}

export async function getSongsByMixtapeId(
  mixtapeId: number,
  songQueryOptions: { currentUserId?: number }
): Promise<Song[]> {
  const query = db!('mixtape_song_entries')
    .select(selectSongs(songQueryOptions))
    .join('songs', { 'songs.id': 'mixtape_song_entries.song_id' })
    .where({ mixtape_id: mixtapeId })
    .orderBy('mixtape_song_entries.rank', 'asc');

  const songRows = await findMany(query, SongWithMetaModelV);
  return songRows.map(serializeSong);
}

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
