import { Router, Response } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

import config from '../config';
import wrapAsyncRoute from '../util/wrapAsyncRoute';
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

      setSpotifyCookies(res, accessToken, refreshToken, expiresIn);
      res.redirect(`${rootUrl}${redirect}`);
    })
  );
}

export function registerSpotifyApiEndpoints(router: Router) {
  router.get(
    '/spotify-token',
    wrapAsyncRoute(async (req, res) => {
      const spotifyRefreshToken = req.cookies['spotifyRefreshToken'];
      const spotifyExpiresAtMs = parseInt(req.cookies['spotifyExpiresAtMs']);

      if (!spotifyExpiresAtMs || isNaN(spotifyExpiresAtMs)) {
        clearSpotifyCookies(res);
        return res.json({ spotifyConnected: false });
      }

      // If token hasn't expired yet, don't bother refreshing
      if (spotifyExpiresAtMs && spotifyExpiresAtMs > Date.now()) {
        return res.json({
          spotifyConnected: true,
          accessToken: req.cookies['spotifyAccessToken'],
          expiresAtMs: spotifyExpiresAtMs,
        });
      }

      let resp: RefreshResponse | undefined;
      try {
        resp = await getRefreshedAccessToken(spotifyRefreshToken!);
      } catch (err) {
        if (err instanceof SpotifyDisconnectedError) {
          clearSpotifyCookies(res);
          return res.json({ spotifyConnected: false });
        }
        throw err;
      }

      const expiresAtMs = setSpotifyCookies(
        res,
        resp.accessToken,
        spotifyRefreshToken,
        resp.expiresIn
      );

      return res.json({
        spotifyConnected: true,
        token: resp.accessToken,
        expiresAtMs: expiresAtMs,
      });
    })
  );

  router.delete(
    '/spotify-token',
    wrapAsyncRoute(async (req, res) => {
      clearSpotifyCookies(res);
      res.status(200).json({ success: true });
    })
  );
}

const toExpiresAtMs = (expiresInSec: number): number =>
  Date.now() + expiresInSec * 1000;

function setSpotifyCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): number {
  res.cookie('spotifyAccessToken', accessToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: 'strict',
  });

  const expiresAtMs = toExpiresAtMs(expiresIn);
  res.cookie('spotifyExpiresAtMs', expiresAtMs, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: 'strict',
  });

  res.cookie('spotifyRefreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
    sameSite: 'strict',
  });

  return expiresAtMs;
}

function clearSpotifyCookies(res: Response) {
  res.clearCookie('spotifyAccessToken');
  res.clearCookie('spotifyRefreshToken');
  res.clearCookie('spotifyExpiresAt');
}
