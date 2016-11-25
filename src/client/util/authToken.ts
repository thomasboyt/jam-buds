import {AUTH_TOKEN_KEY} from '../constants';

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  return localStorage.setItem(AUTH_TOKEN_KEY, token);
}

function setDevUser(name: string) {
  setAuthToken(name);
  document.location.reload();
}

// global this for ease of debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).setDevUser = setDevUser;
}