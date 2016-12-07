import {Express} from 'express';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {isAuthenticated} from '../auth';
import * as spotify from '../apis/spotify';
import * as bandcamp from '../apis/bandcamp';
import * as youtube from '../apis/youtube';

import {SearchResult} from '../../universal/resources';

const SPOTIFY_URL = /https:\/\/open\.spotify\.com\/track\/(.*)/;
const BANDCAMP_URL = /https:\/\/(.*)\.bandcamp\.com\/track\/(.*)/;
const YOUTUBE_URL = /https:\/\/www\.youtube\.com\/watch\?v=(.*)/;

function serializeSpotifyResults(results: any[]): SearchResult[] {
  return results.map((result) => {
    return {
      name: result.name,
      album: result.album.name,
      artists: result.artists.map((artist: any) => artist.name),
      spotifyId: result.id,
    };
  });
}

export default function registerSearchEndpoints(app: Express) {

  // get the title, etc of a sharable link
  app.get('/share-details', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    const url = req.query.url;

    if (!YOUTUBE_URL.test(url)) {
      res.status(400).send({
        error: 'Invalid URL given: must be a Youtube video'
      });

      return;
    }

    const {title, embeddable} = await youtube.getYoutubeDetails(url);

    res.send({
      title,
      embeddable,
    });
  }));

  // search for a song using $whatever_api_i_wrap
  app.get('/spotify-search', isAuthenticated, wrapAsyncRoute(async (req, res) => {
    let query = req.query.query;

    if (!query) {
      res.status(400).send({
        error: 'No query specified'
      });

      return;
    }

    const results = await spotify.search(query);

    res.send({
      songs: serializeSpotifyResults(results),
    });
  }));

}