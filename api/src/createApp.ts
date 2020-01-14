import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as Sentry from '@sentry/node';

import { startSpotifyTokenUpdates } from './apis/spotify';
import { errorHandlerMiddleware } from './util/errors';

import registerAuthEndpoints from './routes/auth';
import registerUserEndpoints from './routes/users';
import registerSearchEndpoints from './routes/search';
import registerPlaylistEndpoints from './routes/playlists';
import registerPostEndpoints from './routes/posts';
import registerLikesEndpoints from './routes/likes';
import registerMixtapeEndpoints from './routes/mixtapes';
import registerSettingsEndpoints from './routes/settings';
import {
  registerSpotifyAuthEndpoints,
  registerSpotifyApiEndpoints,
} from './routes/spotify-auth';
import registerTwitterAuthEndpoints from './routes/twitter-auth';
import registerNotificationsEndpoints from './routes/notifications';

const env = process.env.NODE_ENV;

if (env === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_API,
  });
}

export default function createApp() {
  startSpotifyTokenUpdates();

  const app = express();

  if (env === 'production') {
    app.use(Sentry.Handlers.requestHandler());
  }

  app.use(bodyParser.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: process.env.JB_APP_URL,
    })
  );

  const apiRouter = express.Router();

  registerUserEndpoints(apiRouter);
  registerSearchEndpoints(apiRouter);
  registerPlaylistEndpoints(apiRouter);
  registerLikesEndpoints(apiRouter);
  registerSettingsEndpoints(apiRouter);
  registerPostEndpoints(apiRouter);
  registerMixtapeEndpoints(apiRouter);
  registerNotificationsEndpoints(apiRouter);
  registerSpotifyApiEndpoints(apiRouter);
  app.use('/api', apiRouter);

  const authRouter = express.Router();

  registerAuthEndpoints(authRouter);
  registerSpotifyAuthEndpoints(authRouter);
  registerTwitterAuthEndpoints(authRouter);
  app.use('/auth', authRouter);

  if (env === 'production') {
    app.use(Sentry.Handlers.errorHandler());
  }

  app.use(errorHandlerMiddleware);

  return app;
}
