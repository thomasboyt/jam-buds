import axios from 'axios';
import generateMusicKitToken from '@tboyt/music-kit-jwt';

let token: string;

// skip token generation in unit tests
if (process.env.NODE_ENV !== 'test' || process.env.TEST_ENV === 'feature') {
  token = generateMusicKitToken({
    pathToPrivateKey: process.env.MUSICKIT_PRIVATE_KEY_PATH!,
    keyId: process.env.MUSICKIT_KEY_ID!,
    teamId: process.env.MUSICKIT_TEAM_ID!,
  });
}

/**
 * Returns an Apple Music ID given a song's ISRC.
 */
export async function getAppleMusicIDByISRC(
  isrc: string
): Promise<string | null> {
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
    return song.id;
  }
}
