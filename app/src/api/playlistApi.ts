import type { NuxtAxiosInstance } from '@nuxtjs/axios';
import type { QueryParams, SuccessResponse } from './_helpers';

export async function getPublicFeed(
  axios: NuxtAxiosInstance,
  params: QueryParams<'getPublicFeed'>
): Promise<SuccessResponse<'getPublicFeed'>> {
  const resp = await axios({
    url: '/api/public-feed',
    method: 'GET',
    params,
  });
  return resp.data;
}

export async function getUserFeed(
  axios: NuxtAxiosInstance,
  params: QueryParams<'getUserFeed'>
): Promise<SuccessResponse<'getUserFeed'>> {
  const resp = await axios({
    url: '/api/feed',
    method: 'GET',
    params,
  });
  return resp.data;
}

export async function getUserPlaylist(
  axios: NuxtAxiosInstance,
  username: string,
  params: QueryParams<'getUserPlaylist'>
): Promise<SuccessResponse<'getUserPlaylist'>> {
  const resp = await axios({
    url: `/api/playlists/${username}`,
    method: 'GET',
    params,
  });
  return resp.data;
}

export async function getUserLikesPlaylist(
  axios: NuxtAxiosInstance,
  username: string,
  params: QueryParams<'getUserLikesPlaylist'>
): Promise<SuccessResponse<'getUserLikesPlaylist'>> {
  const resp = await axios({
    url: `/api/playlists/${username}/liked`,
    method: 'GET',
    params,
  });
  return resp.data;
}
