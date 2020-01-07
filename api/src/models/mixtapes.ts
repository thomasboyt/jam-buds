import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';

import { db } from '../db';
import { UserModel, getUserProfileForUser, getUserByUserId } from './user';
import { selectSongsQuery, serializeSong } from './song';
import {
  Mixtape,
  Song,
  PostListItem,
  DraftMixtapeListItem,
} from '../resources';
import validateOrThrow from '../util/validateOrThrow';
import { tPropNames, namespacedAliases, paginate, findMany } from './utils';
import { ENTRY_PAGE_LIMIT } from '../constants';
import { serializePostListItem } from './feed';

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

export const MixtapePreviewModelV = t.intersection([
  MixtapeModelV,
  t.type({
    songCount: t.string,
    authorName: t.string,
  }),
]);

export function selectMixtapePreviews() {
  return [
    db!.raw(
      namespacedAliases('mixtapes', 'mixtape', tPropNames(MixtapeModelV))
    ),
    db!.raw(
      '(SELECT users.name FROM users WHERE users.id=mixtapes.user_id) as "mixtape.author_name"'
    ),
    db!.raw(
      '(SELECT COUNT (*) FROM mixtape_song_entries WHERE mixtape_id=mixtapes.id) as "mixtape.song_count"'
    ),
  ];
}
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

interface QueryOptions {
  currentUserId?: number;
  beforeTimestamp?: string;
  afterTimestamp?: string;
}

export async function getPublishedMixtapesByUserId(
  userId: number,
  opts: QueryOptions = {}
): Promise<PostListItem[]> {
  let query = db!('mixtapes')
    .select(selectMixtapePreviews())
    .select({
      timestamp: 'mixtapes.published_at',
      userName: 'users.name',
    })
    .join('users', { 'users.id': 'mixtapes.user_id' })
    .where({ 'mixtapes.user_id': userId })
    .whereNot({ 'mixtapes.published_at': null })
    .orderBy('mixtapes.published_at', 'desc');

  query = paginate(query, {
    limit: ENTRY_PAGE_LIMIT,
    before: opts.beforeTimestamp,
    after: opts.afterTimestamp,
    columnName: 'mixtapes.published_at',
  });

  const rows = await query;

  return rows.map((row: any) =>
    serializePostListItem({
      ...row,
      userNames: [row.userName],
    })
  );
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
    };
  });
}
