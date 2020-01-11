import { UserModel, createUser } from '../models/user';
import { SongModel, createSong } from '../models/song';
import { postSong, getOwnPostForSongId, PostModel } from '../models/post';
import { createMixtapeForUser, publishMixtape } from '../models/mixtapes';

// SHRUG
let uniqueCounter = 0;
export function uniqueString() {
  uniqueCounter += 1;
  return `${uniqueCounter}`;
}

export async function userFactory(
  opts: Record<string, any> = {}
): Promise<UserModel> {
  const defaults = {
    name: uniqueString(),
    email: `${uniqueString()}@example.example`,
  };

  const finalOpts = { ...defaults, ...opts };

  const user = await createUser(finalOpts);
  return user;
}

export async function songFactory(
  artist: string = uniqueString(),
  title: string = uniqueString()
): Promise<SongModel> {
  const song = await createSong({
    artists: [artist],
    title,
    spotifyId: uniqueString(),
  });

  return song;
}

export async function postFactory(
  opts: Record<string, any> = {}
): Promise<PostModel> {
  const defaults = {
    userId: (await userFactory()).id,
    songId: (await songFactory()).id,
  };

  const finalOpts = { ...defaults, ...opts };

  const song = await postSong(finalOpts);
  const post = await getOwnPostForSongId({
    songId: song.id,
    userId: finalOpts.userId,
  });

  return post!;
}

export async function mixtapeFactory(user: UserModel) {
  const mixtape = await createMixtapeForUser(user, {
    title: 'test mixtape',
  });

  publishMixtape(mixtape.id);
}
