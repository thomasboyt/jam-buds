import axios from 'axios';
import generateMusicKitToken from '@tboyt/music-kit-jwt';

let cachedToken: string;
function getToken(): string {
  if (cachedToken) {
    return cachedToken;
  }

  cachedToken = generateMusicKitToken({
    pathToPrivateKey: process.env.MUSICKIT_PRIVATE_KEY_PATH!,
    keyId: process.env.MUSICKIT_KEY_ID!,
    teamId: process.env.MUSICKIT_TEAM_ID!,
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
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_APPLE_MUSIC) {
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
  } else {
    return {
      id: song.id,
      url: song.attributes.url,
    };
  }
}
