const SPOTIFY_OAUTH_STATE_KEY = 'spotifyOauthState';
const SPOTIFY_OAUTH_REDIRECT_KEY = 'spotifyOauthRedirect';

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
function randomCryptoString() {
  const validChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  window.crypto.getRandomValues(array);
  array = array.map((x) => validChars.charCodeAt(x % validChars.length));
  const randomState = String.fromCharCode.apply(null, array);
  return randomState;
}

export function getAndClearSpotifyOauthState() {
  const state = localStorage.getItem(SPOTIFY_OAUTH_STATE_KEY);
  localStorage.removeItem(SPOTIFY_OAUTH_STATE_KEY);
  return state;
}
export function getAndClearSpotifyOauthRedirect() {
  const redirect = localStorage.getItem(SPOTIFY_OAUTH_REDIRECT_KEY);
  localStorage.removeItem(SPOTIFY_OAUTH_REDIRECT_KEY);
  return redirect;
}
export function createAndSetSpotifyOauthState() {
  const state = randomCryptoString();
  localStorage.setItem(SPOTIFY_OAUTH_STATE_KEY, state);
  return state;
}
export function setSpotifyOauthRedirect(redirect) {
  localStorage.setItem(SPOTIFY_OAUTH_REDIRECT_KEY, redirect);
}
