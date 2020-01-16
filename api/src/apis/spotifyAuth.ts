import axios from 'axios';
import config from '../config';
import externalCallWrapper from '../util/externalCallWrapper';
import { ExternalApiCallError } from '../util/errors';

export class SpotifyDisconnectedError extends Error {}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

export async function getRefreshedAccessToken(
  refreshToken: string
): Promise<RefreshResponse> {
  const auth =
    config.require('SPOTIFY_CLIENT_ID') +
    ':' +
    config.require('SPOTIFY_CLIENT_SECRET');

  // Refresh flow
  let resp;
  try {
    resp = await externalCallWrapper(
      axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        },
        headers: {
          Authorization: 'Basic ' + new Buffer(auth).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
    );
  } catch (err) {
    if (err instanceof ExternalApiCallError) {
      if (
        err.response &&
        err.response.status === 400 &&
        err.response.data.error === 'invalid_grant'
      ) {
        throw new SpotifyDisconnectedError();
      }
    }
    throw err;
  }

  const accessToken = resp.data.access_token;
  // goofy hack: to ensure we refresh "on time," we subtract 20 seconds from
  // this expiration time
  const expiresIn = resp.data.expires_in - 20;

  return { accessToken, expiresIn };
}
