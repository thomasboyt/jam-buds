import axios from 'axios';
import generateMusicKitToken from '@tboyt/music-kit-jwt';
import { SpotifySongResource } from './spotify';

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

export async function getAppleMusicInfoForSpotifyTrack(
  spotifyTrack: SpotifySongResource
): Promise<AppleMusicInfo | null> {
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_APPLE_MUSIC) {
    return null;
  }

  const isrc = spotifyTrack.external_ids.isrc;

  let appleMusicInfo: AppleMusicInfo | null = null;

  if (isrc) {
    appleMusicInfo = await getAppleMusicInfoByISRC(isrc);
  }

  if (!appleMusicInfo) {
    appleMusicInfo = await getAppleMusicInfoByTrackInformation(spotifyTrack);
  }

  return appleMusicInfo;
}

/**
 * Looks up a Apple Music song resource given a song's ISRC. Returns subset of
 * info that needs to be stored in the DB.
 */
export async function getAppleMusicInfoByISRC(
  isrc: string
): Promise<AppleMusicInfo | null> {
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
  } else if (!appleMusicSearchResultCanBePlayed(song)) {
    return null;
  } else {
    return {
      id: song.id,
      url: song.attributes.url,
    };
  }
}

export async function getAppleMusicInfoByTrackInformation(
  spotifyTrack: SpotifySongResource
): Promise<AppleMusicInfo | null> {}

/**
 * XXX: So, for some fucking reason, the Apple Music API appears to return songs
 * that are _only on iTunes_, and not actually have any clear key to distinguish
 * "this can be played" from "this cannot be played"
 *
 * It _looks_ like the `playParams` key only exists on songs that can be played
 * through Apple Music, so I'm going to try using that for now.
 */
function appleMusicSearchResultCanBePlayed(song: any): boolean {
  if (!song.attributes.playParams) {
    console.log(
      `*** Missing playParams for Apple Music song ${
        song.id
      }! Probably only on iTunes?`
    );
    return false;
  }
  return true;
}
