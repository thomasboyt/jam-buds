import { User, createUser } from '../models/user';
import { createSongFromManualEntry, Song } from '../models/song';
import { addSongToPlaylist } from '../models/playlist';
import { PlaylistEntry } from '../resources';

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
): Promise<Song> {
  const song = await createSongFromManualEntry(artist, title);
  return song;
}

export async function entryFactory(
  opts: Record<string, any> = {}
): Promise<PlaylistEntry> {
  const defaults = {
    userId: (await userFactory()).id,
    songId: (await songFactory()).id,
    note: uniqueString(),
  };

  const finalOpts = { ...defaults, ...opts };

  const entry = await addSongToPlaylist(finalOpts);

  return entry;
}
