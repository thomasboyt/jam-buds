import * as t from 'io-ts';
import { date as dateType } from 'io-ts-types/lib/date';
import { db } from '../db';
import { UserModel } from './user';
import genAuthToken from '../util/genAuthToken';
import { findOne } from './utils';

interface SpotifyCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const toExpiresAt = (expiresInSec: number) =>
  new Date(Date.now() + expiresInSec * 1000);

export async function addSpotifyCredentialsToUser(
  user: UserModel,
  spotifyCredentials: SpotifyCredentials
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyRefreshToken: spotifyCredentials.refreshToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}

interface SpotifyRefreshCredentials {
  accessToken: string;
  expiresIn: number;
}

export async function updateRefreshedSpotifyCredentialsForUser(
  user: UserModel,
  spotifyCredentials: SpotifyRefreshCredentials
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: spotifyCredentials.accessToken,
    spotifyExpiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}

export async function deleteSpotifyCredentialsFromUser(
  user: UserModel
): Promise<void> {
  const updateParams: Partial<UserModel> = {
    spotifyAccessToken: null,
    spotifyRefreshToken: null,
    spotifyExpiresAt: null,
  };

  return db!('users')
    .where({ id: user.id })
    .update(updateParams);
}

const AnonymousSpotifyCredentialsModelV = t.type({
  anonUserToken: t.string,
  accessToken: t.string,
  refreshToken: t.string,
  expiresAt: dateType,
});

type AnonymousSpotifyCredentialsModel = t.TypeOf<
  typeof AnonymousSpotifyCredentialsModelV
>;

export async function createAnonymousSpotifyCredentials(
  spotifyCredentials: SpotifyCredentials
): Promise<string> {
  const token = await genAuthToken();

  const creds: AnonymousSpotifyCredentialsModel = {
    anonUserToken: token,
    accessToken: spotifyCredentials.accessToken,
    refreshToken: spotifyCredentials.refreshToken,
    expiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  await db!('anonymous_spotify_credentials').insert(creds);

  return token;
}

export async function getAnonymousSpotifyCredentialsByToken(
  anonUserToken: string
): Promise<AnonymousSpotifyCredentialsModel | null> {
  return findOne(
    db!('anonymous_spotify_credentials').where({ anonUserToken }),
    AnonymousSpotifyCredentialsModelV
  );
}

export async function updateAnonymousSpotifyCredentials(
  anonUserToken: string,
  spotifyCredentials: SpotifyRefreshCredentials
): Promise<string> {
  const updateParams: Partial<AnonymousSpotifyCredentialsModel> = {
    accessToken: spotifyCredentials.accessToken,
    expiresAt: toExpiresAt(spotifyCredentials.expiresIn),
  };

  return db!('anonymous_spotify_credentials')
    .where({ anonUserToken })
    .update(updateParams);
}

export async function deleteAnonymousSpotifyCredentials(
  anonUserToken: string
): Promise<void> {
  await db!('anonymous_spotify_credentials')
    .where({ anonUserToken })
    .delete();
}
