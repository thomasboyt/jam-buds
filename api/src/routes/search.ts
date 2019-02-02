import { Router } from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { isAuthenticated } from '../auth';
import * as spotify from '../apis/spotify';
import * as bandcamp from '../apis/bandcamp';
import * as youtube from '../apis/youtube';
import * as soundcloud from '../apis/soundcloud';

import { getPlaybackSourceForUrl } from '../playbackSources';

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
  // get the title, etc of a sharable link
  router.get(
    '/share-details',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const url = req.query.url;

      const source = getPlaybackSourceForUrl(url);

      if (source === null) {
        return res.status(400).send({
          error: 'Invalid URL',
        });
      }

      if (source === 'youtube') {
        const { title, embeddable } = await youtube.getYoutubeDetails(url);

        return res.send({
          source: 'youtube',
          title,
          embeddable,
        });
      } else if (source === 'bandcamp') {
        const {
          title,
          artist,
          trackId,
          embeddable,
          spotifyQuery,
        } = await bandcamp.getBandcampInformation(url);

        const spotifyResults = await spotify.search(spotifyQuery);

        let spotifyInfo = null;
        if (spotifyResults.length > 0) {
          spotifyInfo = serializeSpotifyResult(spotifyResults[0]);
        }

        return res.send({
          source: 'bandcamp',
          title: `${title} - ${artist}`,
          bandcampTrackId: trackId,
          embeddable,
          spotify: spotifyInfo,
          manualEntrySuggestion: { title, artist },
        });
      } else if (source === 'soundcloud') {
        const {
          streamable,
          trackId,
          title,
        } = await soundcloud.getDetailsFromUrl(url);

        return res.send({
          source: 'soundcloud',
          title,
          soundcloudTrackId: trackId,
          embeddable: streamable,
        });
      }
    })
  );

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
