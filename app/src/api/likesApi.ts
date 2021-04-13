import type { NuxtAxiosInstance } from '@nuxtjs/axios';
import type { PathParams, QueryParams, SuccessResponse } from './_helpers';

export async function createLike(
  axios: NuxtAxiosInstance,
  itemType: PathParams<'createLike'>['type'],
  itemId: PathParams<'createLike'>['itemId'],
  params: QueryParams<'createLike'>
): Promise<SuccessResponse<'createLike'>> {
  const resp = await axios({
    url: `/likes/${itemType}/${itemId}`,
    method: 'PUT',
    params,
  });
  return resp.data;
}

export async function deleteLike(
  axios: NuxtAxiosInstance,
  itemType: PathParams<'deleteLike'>['type'],
  itemId: PathParams<'deleteLike'>['itemId']
): Promise<SuccessResponse<'deleteLike'>> {
  const resp = await axios({
    url: `/likes/${itemType}/${itemId}`,
    method: 'DELETE',
  });
  return resp.data;
}
