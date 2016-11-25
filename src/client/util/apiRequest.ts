import axios, {AxiosRequestConfig} from 'axios';
import {getAuthToken} from './authToken';

export default async function apiRequest(opts: AxiosRequestConfig): Promise<any> {
  opts.url = process.env.SERVER_URL + opts.url;

  const token = getAuthToken();

  if (token) {
    opts.headers = opts.headers || {};
    opts.headers['X-Auth-Token'] = token;
  }

  return await axios(opts);
}