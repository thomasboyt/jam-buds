import * as Cookies from 'js-cookie';
import {AUTH_TOKEN_COOKIE} from '../../universal/constants';

export function getAuthToken(): string | null {
  return Cookies.get(AUTH_TOKEN_COOKIE);
}

function setDevUser(name: string) {
  Cookies.set(AUTH_TOKEN_COOKIE, name);
  document.location.reload();
}

// global this for ease of debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).setDevUser = setDevUser;
}