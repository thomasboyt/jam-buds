import {createUser, CreateUserOptions, User} from '../models/user';
import {createSongFromManualEntry, Song} from '../models/song';
import {addSongToPlaylist} from '../models/playlist';
import {PlaylistEntry} from '../../universal/resources';

// SHRUG
let uniqueCounter = 0;
export function uniqueString() {
  uniqueCounter += 1;
  return `${uniqueCounter}`;
}

export async function userFactory(opts: Object = {}): Promise<User> {
  const defaults = {
    twitterName: uniqueString(),
    twitterId: uniqueString(),
    twitterToken: uniqueString(),
    twitterSecret: uniqueString(),
  };

  const finalOpts: CreateUserOptions = {...defaults, ...opts};

  const user = await createUser(finalOpts);
  return user;
}

export async function songFactory(artist: string = uniqueString(), title: string = uniqueString()): Promise<Song> {
  const song = await createSongFromManualEntry(artist, title);
  return song;
}