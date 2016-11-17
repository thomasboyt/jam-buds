import axios, {AxiosRequestConfig} from 'axios';
import {AUTH_TOKEN_KEY} from '../constants';

export default async function apiRequest(opts: AxiosRequestConfig): Promise<any> {
  opts.url = process.env.SERVER_URL + opts.url;

  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    opts.headers = opts.headers || {};
    opts.headers['X-Auth-Token'] = token;
  }

  return await axios(opts);
}