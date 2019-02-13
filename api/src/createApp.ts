import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import Raven from 'raven';

import registerAuthEndpoints from './routes/auth';
import registerUserEndpoints from './routes/users';
import registerSearchEndpoints from './routes/search';
import registerPlaylistEndpoints from './routes/playlists';
import registerLikesEndpoints from './routes/likes';
import registerSettingsEndpoints from './routes/settings';
import registerSpotifyAuthEndpoints from './routes/spotify-auth';
import registerTwitterAuthEndpoints from './routes/twitter-auth';

const env = process.env.NODE_ENV;

if (env === 'production') {
  Raven.config(process.env.SENTRY_DSN_API).install();
}

export default function createApp() {
  const app = express();

  if (env === 'production') {
    app.use(Raven.requestHandler());
  }

  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.APP_URL,
    })
  );

  const apiRouter = express.Router();

  registerUserEndpoints(apiRouter);
  registerSearchEndpoints(apiRouter);
  registerPlaylistEndpoints(apiRouter);
  registerLikesEndpoints(apiRouter);
  registerSettingsEndpoints(apiRouter);
  app.use('/api', apiRouter);

  const authRouter = express.Router();

  registerAuthEndpoints(authRouter);
  registerSpotifyAuthEndpoints(authRouter);
  registerTwitterAuthEndpoints(authRouter);
  app.use('/auth', authRouter);

  if (env === 'production') {
    app.use(Raven.errorHandler());
  }

  const errorLogger: express.ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);
    next(err);
  };

  app.use(errorLogger);

  return app;
}
