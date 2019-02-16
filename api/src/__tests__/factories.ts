import { User, createUser } from '../models/user';
import { createSongFromManualEntry, SongModel } from '../models/song';
import { createPost } from '../models/post';
import { Post } from '../resources';

// SHRUG
let uniqueCounter = 0;
export function uniqueString() {
  uniqueCounter += 1;
  return `${uniqueCounter}`;
}

export async function userFactory(
  opts: Record<string, any> = {}
): Promise<User> {
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
  const song = await createSongFromManualEntry(artist, title);
  return song;
}

export async function postFactory(
  opts: Record<string, any> = {}
): Promise<Post> {
  const defaults = {
    userId: (await userFactory()).id,
    songId: (await songFactory()).id,
    note: uniqueString(),
  };

  const finalOpts = { ...defaults, ...opts };

  const post = await createPost(finalOpts);

  return post;
}
