import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { isAuthenticated } from '../auth';
import * as spotify from '../apis/spotify';

import { SearchResult } from '../resources';
import {
  cacheSongFromSearchResult,
  getOrCreateSongCacheEntryWithExternalIds,
} from '../util/songSearchCache';

/**
 * Many songs on Spotify have multiple entries for e.g. deluxe editions, or live
 * albums that are also on deluxe editions, or whatnot. This simply filters out
 * some of these entries by seeing if they have the same ISRC.
 *
 * This generally doesn't (and shouldn't) filter out e.g. clean versions of
 * explicit songs, or remastered versions of songs on later rereleases.
 */
const dedupeResultsByISRC = (results: spotify.SpotifySongResource[]) => {
  const dedupedResults = [];

  const seenISRCs = new Set<string>();

  for (const result of results) {
    const isrc = result.external_ids.isrc;

    if (isrc) {
      if (seenISRCs.has(isrc)) {
        continue;
      } else {
        seenISRCs.add(isrc);
      }
    }

    dedupedResults.push(result);
  }

  return dedupedResults;
};

function serializeSpotifyResult(
  result: spotify.SpotifySongResource
): SearchResult {
  return {
    title: result.name,
    album: result.album.name,
    artists: result.artists.map((artist: any) => artist.name),
    spotifyId: result.id,
    albumArt: result.album.images[0].url,
  };
}

function serializeSpotifyResults(
  results: spotify.SpotifySongResource[]
): SearchResult[] {
  return results.map((result) => serializeSpotifyResult(result));
}

export default function registerSearchEndpoints(router: Router) {
  // search for a song using $whatever_api_i_wrap
  router.get(
    '/spotify-search',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const query = req.query.query;

      if (!query) {
        res.status(400).send({
          error: 'No query specified',
        });

        return;
      }

      const results = await spotify.search(query);
      const dedupedResults = dedupeResultsByISRC(results);

      for (const result of dedupedResults) {
        await cacheSongFromSearchResult(result.id, result);
      }

      res.send({
        songs: serializeSpotifyResults(dedupedResults),
      });
    })
  );

  // given a spotify track ID, find the song on other streaming services
  router.get(
    '/spotify-details/:spotifyId',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const spotifyId = req.params.spotifyId;

      const entry = await getOrCreateSongCacheEntryWithExternalIds(spotifyId);

      if (!entry) {
        return res.status(404).send({
          error: `No track found for Spotify ID ${spotifyId}`,
        });
      }

      // TODO: Create a resource entry for this...
      res.send({
        spotifyId: entry.spotifyId,
        appleMusicId: entry.appleMusicId,
      });
    })
  );
}
