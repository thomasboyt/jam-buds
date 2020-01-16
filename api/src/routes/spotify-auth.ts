import { Router } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

import config from '../config';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
import { UserModel } from '../models/user';
import {
  addSpotifyCredentialsToUser,
  deleteSpotifyCredentialsFromUser,
  updateRefreshedSpotifyCredentialsForUser,
  createAnonymousSpotifyCredentials,
  getAnonymousSpotifyCredentialsByToken,
  updateAnonymousSpotifyCredentials,
  deleteAnonymousSpotifyCredentials,
} from '../models/spotifyCredentials';
import {
  isAuthenticated,
  maybeGetUserFromCookie,
  getUserFromRequest,
} from '../auth';
import {
  createOAuthState,
  getAndClearOAuthState,
} from '../models/cache/oauthStateCache';
import {
  getRefreshedAccessToken,
  RefreshResponse,
  SpotifyDisconnectedError,
} from '../apis/spotifyAuth';

const redirectUri = `${config.get('JB_APP_URL')}/auth/spotify-connect/cb`;

const ANON_SPOTIFY_AUTH_TOKEN_COOKIE = 'anonSpotifyAuthToken';

export function registerSpotifyAuthEndpoints(router: Router) {
  router.get(
    '/spotify-connect',
    wrapAsyncRoute(async (req, res) => {
      const state = await createOAuthState(req.query.redirect || '/');

      const spotifyApi = new SpotifyWebApi({
        redirectUri,
        clientId: config.require('SPOTIFY_CLIENT_ID'),
      });

      res.redirect(
        spotifyApi.createAuthorizeURL(
          [
            'streaming',
            'user-read-birthdate',
            'user-read-email',
            'user-read-private',
          ],
          state
        )
      );
    })
  );

  router.get(
    '/spotify-connect/cb',
    wrapAsyncRoute(async (req, res) => {
      const state = req.query.state;

      const redirect = await getAndClearOAuthState(state);

      if (!redirect) {
        return res.status(400).send('Invalid state param');
      }

      const code = req.query.code;
      const auth =
        config.require('SPOTIFY_CLIENT_ID') +
        ':' +
        config.require('SPOTIFY_CLIENT_SECRET');

      const resp = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        },
        headers: {
          Authorization: 'Basic ' + new Buffer(auth).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = resp.data['access_token'];
      const refreshToken = resp.data['refresh_token'];
      const expiresIn = resp.data['expires_in'];

      const spotifyClient = new SpotifyWebApi();
      spotifyClient.setAccessToken(accessToken);
      const userInformation = await spotifyClient.getMe();

      const rootUrl = config.get('JB_APP_URL');

      if (userInformation.body.product !== 'premium') {
        res.redirect(`${rootUrl}${redirect}?failed-spotify-connect`);
        return;
      }

      const user = await maybeGetUserFromCookie(req);

      if (user) {
        await addSpotifyCredentialsToUser(user, {
          accessToken,
          refreshToken,
          expiresIn,
        });
      } else {
        const token = await createAnonymousSpotifyCredentials({
          accessToken,
          refreshToken,
          expiresIn,
        });

        res.cookie(ANON_SPOTIFY_AUTH_TOKEN_COOKIE, token, {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: 'strict',
        });
      }

      res.redirect(`${rootUrl}${redirect}`);
    })
  );
}

export function registerSpotifyApiEndpoints(router: Router) {
  router.get(
    '/spotify-token',
    wrapAsyncRoute(async (req, res) => {
      const user = await getUserFromRequest(req);

      if (user) {
        const { spotifyExpiresAt } = user;

        if (!spotifyExpiresAt) {
          return res.json({ spotifyConnected: false });
        }

        // If token hasn't expired yet, don't bother refreshing
        if (spotifyExpiresAt && spotifyExpiresAt.valueOf() > Date.now()) {
          return res.json({ token: user.spotifyAccessToken });
        }

        let resp: RefreshResponse | undefined;
        try {
          resp = await getRefreshedAccessToken(user.spotifyRefreshToken!);
        } catch (err) {
          if (err instanceof SpotifyDisconnectedError) {
            await deleteSpotifyCredentialsFromUser(user);
            return res.json({ spotifyConnected: false });
          }
          throw err;
        }

        await updateRefreshedSpotifyCredentialsForUser(user, {
          accessToken: resp.accessToken,
          expiresIn: resp.expiresIn,
        });

        res.json({ token: resp.accessToken, expiresIn: resp.expiresIn });
      } else {
        const token = req.cookies[ANON_SPOTIFY_AUTH_TOKEN_COOKIE];

        if (!token) {
          return res.json({ spotifyConnected: false });
        }

        const spotifyCredentials = await getAnonymousSpotifyCredentialsByToken(
          token
        );

        if (!spotifyCredentials) {
          return res.json({ spotifyConnected: false });
        }

        // If token hasn't expired yet, don't bother refreshing
        if (
          spotifyCredentials.expiresAt &&
          spotifyCredentials.expiresAt.valueOf() > Date.now()
        ) {
          return res.json({ token: spotifyCredentials.accessToken });
        }

        let resp: RefreshResponse | undefined;
        try {
          resp = await getRefreshedAccessToken(spotifyCredentials.refreshToken);
        } catch (err) {
          if (err instanceof SpotifyDisconnectedError) {
            await deleteAnonymousSpotifyCredentials(token);
            res.clearCookie(ANON_SPOTIFY_AUTH_TOKEN_COOKIE);
            return res.json({ spotifyConnected: false });
          }
          throw err;
        }

        await updateAnonymousSpotifyCredentials(token, {
          accessToken: resp.accessToken,
          expiresIn: resp.expiresIn,
        });

        res.json({ token: resp.accessToken, expiresIn: resp.expiresIn });
      }
    })
  );

  router.delete(
    '/spotify-token',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      await deleteSpotifyCredentialsFromUser(user);

      res.status(200).json({ success: true });
    })
  );
}
