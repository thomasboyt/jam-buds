import { Handle } from '@tboyt/jareth';
import { HttpError } from 'restea';
import * as songsDal from '../dal/songsDal';
import * as likesDal from '../dal/likesDal';

async function ensureSongExists(handle: Handle, songId: number) {
  const songExists = await songsDal.songIdExists(handle, { songId });

  if (!songExists) {
    // TODO: should this return an error instead of throwing?
    throw new HttpError(
      404,
      'SONG_NOT_FOUND',
      `Could not find song with ID ${songId}`
    );
  }
}

export async function likeSong(
  handle: Handle,
  { songId, currentUserId }: { songId: number; currentUserId: number }
) {
  await ensureSongExists(handle, songId);

  const likeExists = await likesDal.songLikeExists(handle, {
    songId,
    userId: currentUserId,
  });

  if (likeExists === true) {
    // This is just treated as "success" because it's an idempotent operation
    // (no point in saying "couldn't like song" when the user did, in the past,
    // already like the song.)
    return;
  }

  await likesDal.likeSong(handle, { songId, userId: currentUserId });
}

export async function unlikeSong(
  handle: Handle,
  { songId, currentUserId }: { songId: number; currentUserId: number }
) {
  await ensureSongExists(handle, songId);

  await likesDal.unlikeSong(handle, { songId, userId: currentUserId });
}
