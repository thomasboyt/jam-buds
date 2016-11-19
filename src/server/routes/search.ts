import {Express} from 'express';
import {isAuthenticated} from '../auth';
import * as spotify from '../spotify';

export default function registerSearchEndpoints(app: Express) {

  // search for a song using $whatever_api_i_wrap
  app.get('/songs', isAuthenticated, async (req, res) => {
    const query = req.query.query;

    if (!query) {
      res.status(400).send({
        error: 'No query specified'
      });

      return;
    }

    const results = await spotify.search(query);

    res.send({
      results: [],
    });
  });

}