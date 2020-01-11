import * as spotify from '../apis/spotify';
import { getAppleMusicInfoByISRC, AppleMusicInfo } from '../apis/appleMusic';

// result format, currently
interface CacheEntry {
  // full spotify search result
  spotify: spotify.SpotifySongResource;
  spotifyId: string;
  // external ids
  didHydrateExternalIds: boolean;
  appleMusicId?: string;
  appleMusicUrl?: string;
}

// TODO: move this whole fuckin thing to redis
const searchCache: Record<string, CacheEntry> = {};

/**
 * Creates a song search cache entry from Spotify search results. Does not
 * hydrate external IDs, as those are looked up when the user selects a song.
 */
export async function cacheSongFromSearchResult(
  id: string,
  result: spotify.SpotifySongResource
): Promise<CacheEntry> {
  searchCache[id] = {
    spotify: result,
    spotifyId: id,
    didHydrateExternalIds: false,
  };

  return searchCache[id];
}

async function updateCacheWithAppleMusicInfo(
  spotifyId: string,
  appleMusicInfo: AppleMusicInfo
): Promise<CacheEntry> {
  const cached = searchCache[spotifyId];

  if (!cached) {
    throw new Error(`missing cache for ID ${spotifyId}`);
  }

  searchCache[spotifyId] = {
    ...cached,
    didHydrateExternalIds: true,
    appleMusicId: appleMusicInfo.id,
    appleMusicUrl: appleMusicInfo.url,
  };

  return searchCache[spotifyId];
}

/**
 * Hydrates the song search cache by a Spotify ID.
 *
 * If the track has not been previously cached, it will look up the track by ID,
 * returning null if not found. It will also hydrate the external IDs of a
 * track, such as its Apple Music ID.
 */
export async function getOrCreateSongCacheEntryWithExternalIds(
  spotifyId: string
): Promise<CacheEntry | null> {
  let cacheEntry = searchCache[spotifyId];

  if (!cacheEntry) {
    const spotifyTrack = await spotify.getTrackById(spotifyId);

    if (!spotifyTrack) {
      return null;
    }

    cacheEntry = await cacheSongFromSearchResult(spotifyId, spotifyTrack);
  }

  if (cacheEntry.didHydrateExternalIds) {
    // fully hydrated already
    return cacheEntry;
  }

  // const appleMusicInfo = cacheEntry.isrc
  //   ? await getAppleMusicInfoByISRC(cacheEntry.isrc)
  //   : null;

  const appleMusicInfo = await getAppleMusicInfoForSpotifyTrack(
    cacheEntry.spotify
  );

  if (appleMusicInfo) {
    return updateCacheWithAppleMusicInfo(spotifyId, appleMusicInfo);
  }

  return cacheEntry;
}
