import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';

import { db } from '../db';
import { UserModel, getUserProfileForUser, getUserByUserId } from './user';
import { selectSongsQuery, serializeSong } from './song';
import { Mixtape, Song } from '../resources';
import validateOrThrow from '../util/validateOrThrow';

export const MixtapeModelV = t.type({
  id: t.number,
  title: t.string,
  userId: t.number,
  createdAt: dateType,
  publishedAt: t.union([dateType, t.null]),
});

export const MixtapeSongEntryModelV = t.type({
  songId: t.number,
  mixtapeId: t.number,
  rank: t.number,
});

interface CreateMixtapeOptions {
  title: string;
}

/**
 * Create a mixtape for a given user.
 *
 * Returns the mixtape ID as a number so the _app_ can redirect to /mixtapes/:id.
 */
export async function createMixtapeForUser(
  user: UserModel,
  options: CreateMixtapeOptions
): Promise<number> {
  const [{ id }] = await db!('mixtapes').insert(
    { title: options.title, userId: user.id },
    ['id']
  );

  return id;
}

/**
 * Set the title of a given mixtape.
 */
export async function setMixtapeTitle({
  mixtapeId,
  title,
}: {
  mixtapeId: number;
  title: string;
}): Promise<void> {
  await db!('mixtapes')
    .where({ id: mixtapeId })
    .update({ title });
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
  const [row] = await db!('mixtapes').where({ id: mixtapeId });

  if (!row) {
    return null;
  }

  const mixtapeModel = validateOrThrow(MixtapeModelV, row);

  const tracks = await getSongsByMixtapeId(mixtapeId, songQueryOptions);
  const authorUser = await getUserByUserId(mixtapeModel.userId);

  if (!authorUser) {
    throw new Error(`no user ${mixtapeModel.userId} for mixtape ${mixtapeId}`);
  }

  const author = await getUserProfileForUser(authorUser);

  // XXX: watch out for this suddenly being a string if we start using a
  // json-namespaced query
  const publishedAt = mixtapeModel.publishedAt as Date | null;
  const serializedDate = publishedAt ? publishedAt.toISOString() : null;

  return {
    id: mixtapeModel.id,
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
  const query = selectSongsQuery(db!('mixtape_song_entries'), songQueryOptions)
    .join('songs', { 'songs.id': 'mixtape_song_entries.song_id' })
    .where({ mixtape_id: mixtapeId })
    .orderBy('mixtape_song_entries.rank', 'asc');

  const songRows = await query;

  return songRows.map((row: any) => serializeSong(row));
}

export async function getDraftMixtapeIdForUserId(
  userId: number
): Promise<number | null> {
  const [mixtape] = await db!('mixtapes').where({ userId, publishedAt: null });

  if (!mixtape) {
    return null;
  }

  return mixtape.id;
}
