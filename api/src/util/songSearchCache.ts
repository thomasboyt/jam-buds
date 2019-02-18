import * as spotify from '../apis/spotify';
import { getAppleMusicIDByISRC } from '../apis/appleMusic';

// result format, currently
interface CacheEntry {
  // full spotify search result
  spotify: spotify.SpotifySongResource;
  spotifyId: string;
  isrc?: string;
  // external ids
  didHydrateExternalIds: boolean;
  appleMusicId?: string;
}

// TODO: move this whole fuckin thing to redis
let searchCache: Record<string, CacheEntry> = {};

/**
 * Creates a song search cache entry from Spotify search results. Does not
 * hydrate external IDs, as those are looked up when the user selects a song.
 */
export async function cacheSongFromSearchResult(
  id: string,
  result: spotify.SpotifySongResource
): Promise<CacheEntry> {
  const isrc = result.external_ids.isrc;

  searchCache[id] = {
    spotify: result,
    spotifyId: id,
    isrc,
    didHydrateExternalIds: false,
  };

  return searchCache[id];
}

async function updateCacheWithAppleMusicId(
  spotifyId: string,
  appleMusicId: string
): Promise<CacheEntry> {
  const cached = searchCache[spotifyId];

  if (!cached) {
    throw new Error(`missing cache for ID ${spotifyId}`);
  }

  searchCache[spotifyId] = {
    ...cached,
    didHydrateExternalIds: true,
    appleMusicId,
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

  const appleMusicId = cacheEntry.isrc
    ? await getAppleMusicIDByISRC(cacheEntry.isrc)
    : null;

  if (appleMusicId) {
    return await updateCacheWithAppleMusicId(spotifyId, appleMusicId);
  }

  return cacheEntry;
}
