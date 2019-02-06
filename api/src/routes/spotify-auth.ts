import { Router } from 'express';
import * as SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';

import wrapAsyncRoute from '../util/wrapAsyncRoute';
import {
  addSpotifyCredentialsToUser,
  deleteSpotifyCredentialsFromUser,
  User,
} from '../models/user';
import { getUserFromCookie, isAuthenticated } from '../auth';

const redirectUri = `${process.env.APP_URL}/auth/spotify-connect/cb`;

const spotifyApi = new SpotifyWebApi({
  redirectUri,
  clientId: process.env.SPOTIFY_CLIENT_ID,
});

export default function registerSpotifyAuthEndpoints(router: Router) {
  router.get('/spotify-connect', (req, res) => {
    res.redirect(
      spotifyApi.createAuthorizeURL([
        'streaming',
        'user-read-birthdate',
        'user-read-email',
        'user-read-private',
      ])
    );
  });

  router.get(
    '/spotify-connect/cb',
    wrapAsyncRoute(async (req, res) => {
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

      await addSpotifyCredentialsToUser(user, {
        accessToken,
        refreshToken,
        expiresIn,
      });

      res.redirect(`${process.env.APP_URL}/settings`);
    })
  );

  router.delete(
    '/spotify-connect',
    isAuthenticated,
    wrapAsyncRoute(async (req, res) => {
      const user: User = res.locals.user;

      await deleteSpotifyCredentialsFromUser(user);

      res.status(200).json({ success: true });
    })
  );
}
