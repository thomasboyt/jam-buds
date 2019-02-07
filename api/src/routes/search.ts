import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { isAuthenticated } from '../auth';
import * as spotify from '../apis/spotify';

import { SearchResult } from '../resources';

function serializeSpotifyResult(result: any): SearchResult {
  return {
    name: result.name,
    album: result.album.name,
    artists: result.artists.map((artist: any) => artist.name),
    spotifyId: result.id,
  };
}

function serializeSpotifyResults(results: any[]): SearchResult[] {
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

      res.send({
        songs: serializeSpotifyResults(results),
      });
    })
  );
}
