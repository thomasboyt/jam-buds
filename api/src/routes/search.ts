import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { isAuthenticated } from '../auth';
import * as spotify from '../apis/spotify';

import { SearchResult } from '../resources';
import {
  cacheSongFromSearchResult,
  getOrCreateSongCacheEntryWithExternalIds,
} from '../util/songSearchCache';

function serializeSpotifyResult(
  result: spotify.SpotifySongResource
): SearchResult {
  return {
    title: result.name,
    album: result.album.name,
    artists: result.artists.map((artist: any) => artist.name),
    spotifyId: result.id,
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
      let query = req.query.query;

      if (!query) {
        res.status(400).send({
          error: 'No query specified',
        });

        return;
      }

      const results = await spotify.search(query);

      for (let result of results) {
        await cacheSongFromSearchResult(result.id, result);
      }

      res.send({
        songs: serializeSpotifyResults(results),
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
