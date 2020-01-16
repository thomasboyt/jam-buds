import axios from 'axios';
import generateMusicKitToken from '@tboyt/music-kit-jwt';
import config from '../config';

let cachedToken: string;
function getToken(): string {
  if (cachedToken) {
    return cachedToken;
  }

  cachedToken = generateMusicKitToken({
    pathToPrivateKey: config.require('MUSICKIT_PRIVATE_KEY_PATH'),
    keyId: config.require('MUSICKIT_KEY_ID'),
    teamId: config.require('MUSICKIT_TEAM_ID'),
  });

  return cachedToken;
}

export interface AppleMusicInfo {
  id: string;
  url: string;
}

/**
 * Looks up a Apple Music song resource given a song's ISRC. Returns subset of
 * info that needs to be stored in the DB.
 */
export async function getAppleMusicInfoByISRC(
  isrc: string
): Promise<AppleMusicInfo | null> {
  if (config.get('NODE_ENV') === 'test' || config.get('DISABLE_APPLE_MUSIC')) {
    return null;
  }

  const token = getToken();

  const searchUrl = `https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=${isrc}`;

  const resp = await axios.get(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const song = resp.data.data[0];

  if (!song) {
    return null;
  } else if (!song.attributes.playParams) {
    // XXX: So, for some fucking reason, the Apple Music API appears to return
    // songs that are _only on iTunes_, and not actually have any clear key to
    // distinguish "this can be played" from "this cannot be played"
    //
    // It _looks_ like the `playParams` key only exists on songs that can be
    // played through Apple Music, so I'm going to try using that for now.
    console.log(
      `*** Missing playParams for Apple Music song ${
        song.id
      }! Probably only on iTunes?`
    );
    return null;
  } else {
    return {
      id: song.id,
      url: song.attributes.url,
    };
  }
}
