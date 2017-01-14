import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
const raven = require('raven');

import registerTwitterEndpoints from './routes/twitter';
import registerUserEndpoints from './routes/users';
import registerSearchEndpoints from './routes/search';
import registerPlaylistEndpoints from './routes/playlists';
import registerLikesEndpoints from './routes/likes';

export default function createApp(env?: string) {
  const app = express();

  if (env === 'production') {
    app.use(raven.middleware.express.requestHandler(process.env.SENTRY_DSN));
  }

  app.use(bodyParser.json());
  app.use(cors({
    origin: process.env.STATIC_URL,
  }));

  registerUserEndpoints(app);
  registerTwitterEndpoints(app);
  registerSearchEndpoints(app);
  registerPlaylistEndpoints(app);
  registerLikesEndpoints(app);

  if (env === 'production') {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY_DSN));
  }

  const errorLogger: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    next(err);
  };

  app.use(errorLogger);

  return app;
}
