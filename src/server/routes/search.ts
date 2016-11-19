import {Express} from 'express';
import {isAuthenticated} from '../auth';
import * as spotify from '../apis/spotify';
import * as bandcamp from '../apis/bandcamp';

import {SearchResult} from '../../universal/resources';

const SPOTIFY_URL = /https:\/\/open.spotify.com\/track\/(.*)/;
const BANDCAMP_URL = /https:\/\/(.*).bandcamp.com\/track\/(.*)/;

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

  // search for a song using $whatever_api_i_wrap
  app.get('/songs', isAuthenticated, async (req, res) => {
    let query = req.query.query;

    if (!query) {
      res.status(400).send({
        error: 'No query specified'
      });

      return;
    }

    let results = [];
    if (SPOTIFY_URL.test(query)) {
      const spotifyId = (query.match(SPOTIFY_URL)!)[1];
      // TODO: look up from database before making request
      const song = await spotify.getTrackById(spotifyId);
      results = [song];

    } else {
      if (BANDCAMP_URL.test(query)) {
        query = await bandcamp.getSpotifyQuery(query);
      }

      results = await spotify.search(query);
    }

    res.send({
      songs: serializeSpotifyResults(results),
    });
  });

}