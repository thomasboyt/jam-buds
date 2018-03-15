import axios from 'axios';
import _ from 'lodash';

/**
 * Currently be passed the store context so it can get authToken!
 *
 * There may be a more elegant version of this in the future, but it CANNOT be a singleton
 * module that gets configured or something, because of
 * https://github.com/vuejs/vue-ssr-docs/blob/master/en/structure.md#avoid-stateful-singletons
 */
export default async function apiRequest(context, opts) {
  const authToken = _.get(context, 'state.authToken');

  // runtime type checking here because I am a Known Idiot who is definitely gonna forget to pass
  // context as the first arg
  if (authToken === undefined) {
    throw new Error('can\'t find auth token in context passed to apiRequest()');
  }

  const apiClient = axios.create({
    baseURL: `${process.env.API_URL}/api/`,
    headers: {
      'X-Auth-Token': authToken,
    },
  });

  return await apiClient(opts);
}