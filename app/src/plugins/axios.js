import { parse as parseCookie } from 'cookie';

export default function({ $axios }) {
  if (process.client) {
    const cookie = parseCookie(document.cookie);
    const authToken = cookie.jamBudsAuthToken;

    if (authToken) {
      $axios.defaults.headers = {
        'X-Auth-Token': authToken,
      };
    }
  }

  $axios.onRequest((config) => {
    // TODO: Add a nice request log somehow
    // console.log('Making request to ' + config.url);
  });
}
