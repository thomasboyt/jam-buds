import { Router } from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {
  addSpotifyCredentialsToUser,
  deleteSpotifyCredentialsFromUser,
  UserModel,
  updateRefreshedSpotifyCredentialsForUser,
} from '../models/user';
import { getUserFromCookie, isAuthenticated } from '../auth';
import {
  createOAuthState,
  getAndClearOAuthState,
} from '../models/cache/oauthStateCache';

const redirectUri = `${process.env.APP_URL}/auth/spotify-connect/cb`;

const spotifyApi = new SpotifyWebApi({
  redirectUri,
  clientId: process.env.SPOTIFY_CLIENT_ID,
});

export default function registerSpotifyAuthEndpoints(router: Router) {
  router.get(
    '/spotify-connect',
    wrapAsyncRoute(async (req, res) => {
      const state = await createOAuthState(req.query.redirect || '/');

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

      const user = await getUserFromCookie(req);

      const code = req.query.code;
      const auth =
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET;

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

      if (userInformation.body.product !== 'premium') {
        res.redirect(
          `${process.env.APP_URL}${redirect}?failed-spotify-connect`
        );
        return;
      }

      await addSpotifyCredentialsToUser(user, {
        accessToken,
        refreshToken,
        expiresIn,
      });

      res.redirect(`${process.env.APP_URL}${redirect}`);
    })
  );

  router.get(
    '/spotify-connect/token',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      const auth =
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET;

      const { spotifyExpiresAt } = user;

      // If token hasn't expired yet, don't bother refreshing
      if (spotifyExpiresAt && spotifyExpiresAt.valueOf() > Date.now()) {
        return res.json({ token: user.spotifyAccessToken });
      }

      // Refresh flow
      const resp = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          refresh_token: user.spotifyRefreshToken,
          grant_type: 'refresh_token',
        },
        headers: {
          Authorization: 'Basic ' + new Buffer(auth).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const accessToken = resp.data.access_token;
      // goofy hack: to ensure we refresh "on time," we subtract 20 seconds from
      // this expiration time
      const expiresIn = resp.data.expires_in - 20;

      await updateRefreshedSpotifyCredentialsForUser(user, {
        accessToken,
        expiresIn,
      });

      res.status(200).json({ token: accessToken, expiresIn });
    })
  );

  router.delete(
    '/spotify-connect',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: UserModel = res.locals.user;

      await deleteSpotifyCredentialsFromUser(user);

      res.status(200).json({ success: true });
    })
  );
}
