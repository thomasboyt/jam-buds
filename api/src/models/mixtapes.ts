import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types';

import { db } from '../db';
import { UserModel } from './user';
import { Mixtape } from '../resources';
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
  const [id] = await db!('mixtapes').insert(
    { title: options.title, userId: user.id },
    ['id']
  );

  return id;
}

// /**
//  * Set the title of a given mixtape. Throws an error if the mixtape is not found.
//  */
// export async function setMixtapeTitle(
//   mixtapeId: number,
//   title: string
// ): Promise<void> {}

// /**
//  * Add a song to a mixtape. Should throw an error if the song is already
//  * present.
//  */
// export async function addSongToMixtape(
//   mixtapeId: number,
//   songId: number
// ): Promise<void> {}

// /**
//  * Remove a song from a mixtape. No-op if the song isn't present?
//  */
// export async function removeSongFromMixtape(
//   mixtapeId: number,
//   songId: number
// ): Promise<void> {}

// /**
//  * Re-order a mixtape, updating each entry's `rank` by its position in the `songIds[]` array. Throws an error if a song ID isn't present in the mixtape.
//  */
// export async function reorderMixtapeSongs(
//   mixtapeId: number,
//   songIds: number[]
// ): Promise<void> {}

// /**
//  * Publish a mixtape, which allows it to be included in the feed.
//  */
// export async function publishMixtape(mixtapeId: number): Promise<void> {}

// /**
//  * Get a mixtape by ID.
//  */
export async function getMixtapeById(
  mixtapeId: number
): Promise<Mixtape | null> {
  const [row] = await db!('mixtapes').where({ id: mixtapeId });

  if (!row) {
    return null;
  }

  const mixtapeModel = validateOrThrow(MixtapeModelV, row);

  return {
    id: mixtapeModel.id,
    isPublished: !!mixtapeModel.publishedAt,
    title: mixtapeModel.title,
    // TODO
    tracks: [],
  };
}
