import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import registerTwitterEndpoints from './routes/twitter';
import registerUserEndpoints from './routes/users';
import registerSearchEndpoints from './routes/search';
import registerPlaylistEndpoints from './routes/playlists';

export default function createApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cors({
    origin: process.env.STATIC_URL,
  }));

  registerUserEndpoints(app);
  registerTwitterEndpoints(app);
  registerSearchEndpoints(app);
  registerPlaylistEndpoints(app);

  return app;
}
